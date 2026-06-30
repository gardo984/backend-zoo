import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';

export interface BookPayload {
	/** FastAPI Book ID (use either `id` or `book_id`) */
	id?: number;
	book_id?: number;
	name: string;
	category_description?: string | null;
	author_description?: string | null;
	active: boolean;
	description?: string | null;
	image?: string | null;
	price: number;
}


@Injectable()
export class ProductService {
	constructor(
		@InjectRepository(Product)
		private readonly productRepository: Repository<Product>,
	) {}

	async findByExternalId(externalId: number): Promise<Product | null> {
		return this.productRepository.findOne({
			where: { external_id: externalId },
		});
	}

	async upsertFromPayload(payload: BookPayload): Promise<Product> {
		const externalId = payload.id ?? payload.book_id;
		if (externalId == null) {
			throw new Error('Payload missing both id and book_id');
		}
		let product = await this.findByExternalId(externalId);

		if (product) {
			// Update existing
			product.name = payload.name;
			product.category_description = payload.category_description ?? null;
			product.author_description = payload.author_description ?? null;
			product.active = payload.active;
			product.description = payload.description ?? null;
			product.image = payload.image ?? null;
			product.price = payload.price;
		} else {
			// Create new
			product = this.productRepository.create({
				name: payload.name,
				external_id: externalId,
				category_description: payload.category_description ?? null,
				author_description: payload.author_description ?? null,
				active: payload.active,
				description: payload.description ?? null,
				image: payload.image ?? null,
				price: payload.price,
			});
		}

		return this.productRepository.save(product);
	}
}
