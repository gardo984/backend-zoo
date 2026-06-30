import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { ProductService, BookPayload } from '../product/product.service';


const BOOK_EVENTS_CHANNEL = process.env.REDIS_BOOK_CHANNEL || 'book_updates';


@Injectable()
export class ListenerService implements OnModuleInit {
	private readonly logger = new Logger(ListenerService.name);

	constructor(
		private readonly redisService: RedisService,
		private readonly productService: ProductService,
	) {}

	async onModuleInit(): Promise<void> {
		this.logger.log(
			`Initializing listener on Redis channel: ${BOOK_EVENTS_CHANNEL}`,
		);

		await this.redisService.subscribe(
			BOOK_EVENTS_CHANNEL,
			(rawMessage: string, channel: string) => {
				this.handleMessage(rawMessage, channel);
			},
		);
	}

	private async handleMessage(rawMessage: string, channel: string): Promise<void> {
		try {
			const payload: BookPayload = JSON.parse(rawMessage);
			this.logger.log(
				`Received book event on channel "${channel}": Book ID=${payload.id}, name="${payload.name}"`,
			);

			const product = await this.productService.upsertFromPayload(payload);
			this.logger.log(
				`Product synced: ID=${product.id}, external_id=${product.external_id}, name="${product.name}"`,
			);
		} catch (error: any) {
			this.logger.error(
				`Failed to process message on channel "${channel}": ${error.message}`,
			);
		}
	}
}
