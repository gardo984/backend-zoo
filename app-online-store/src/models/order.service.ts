import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Order } from "./order.entity";
import { Repository } from "typeorm";



@Injectable()
export class OrderService {
	constructor(
		@InjectRepository(Order)
		private orderRepository: Repository<Order>
	) {}

	async createOrUpdate(orderInstance: Order) : Promise<Order> {
		return this.orderRepository.save(orderInstance);
	}

	async findByUserId(userId: number) : Promise<Order[] | null> {
		return this.orderRepository.find({
			where: {user: {id: userId}},
			relations: ['items', 'items.product'],
		})
	}
}