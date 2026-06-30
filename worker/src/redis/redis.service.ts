import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';


export interface RedisConfig {
	host: string;
	port: number;
	password?: string;
}


@Injectable()
export class RedisService implements OnModuleDestroy {
	private readonly logger = new Logger(RedisService.name);
	private readonly subscriber: Redis;

	constructor(config: RedisConfig = { host: 'localhost', port: 6379 }) {
		this.subscriber = new Redis({
			host: config.host,
			port: config.port,
			password: config.password,
		});

		this.subscriber.on('connect', () => {
			this.logger.log(`Connected to Redis at ${config.host}:${config.port}`);
		});

		this.subscriber.on('error', (err) => {
			this.logger.error(`Redis error: ${err.message}`);
		});
	}

	/**
	 * Subscribe to a Redis channel and invoke the callback for every message.
	 */
	async subscribe(
		channel: string,
		onMessage: (message: string, channel: string) => void,
	): Promise<void> {
		await this.subscriber.subscribe(channel);
		this.logger.log(`Subscribed to Redis channel: ${channel}`);

		this.subscriber.on('message', (ch, msg) => {
			if (ch === channel) {
				onMessage(msg, ch);
			}
		});
	}

	/**
	 * Unsubscribe from a channel.
	 */
	async unsubscribe(channel: string): Promise<void> {
		await this.subscriber.unsubscribe(channel);
		this.logger.log(`Unsubscribed from Redis channel: ${channel}`);
	}

	async onModuleDestroy(): Promise<void> {
		await this.subscriber.quit();
		this.logger.log('Redis connection closed');
	}
}
