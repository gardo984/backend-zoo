
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Product } from './products.entity';

@Injectable()
export class ProductsService {
	constructor(
		@InjectRepository(Product)
		private productsRepository: Repository<Product>,
	) {}

	async findAll(): Promise<Product[]> {
		return this.productsRepository.find();
	}

	async findOne(id: number): Promise<Product | null> {
		return this.productsRepository.findOne({
			where: {
				id: id
			}
		});
	}

	async createOrUpdate(product: Product): Promise<Product> {
		return this.productsRepository.save(product)
	}

	async remove(id: string): Promise<void> {
		await this.productsRepository.delete(id)
	}

	async findByIds(productsId: string[]): Promise<Product[]> {
		return await this.productsRepository.findBy({ id: In(productsId) })
	}
}
