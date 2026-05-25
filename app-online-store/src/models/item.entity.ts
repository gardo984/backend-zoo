import { Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Order } from "./order.entity";
import { Product } from "./products.entity";


@Entity()
export class Item {

	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	quantity: number;

	@Column()
	price: number;

	@ManyToOne(() => Order, (order) => order.items)
	order: Order;

	@ManyToOne(() => Product, (product) => product.items)
	product: Product;


	getId():number {
		return this.id;
	}

	setId(value: number) {
		this.id = value;
	}

	getQuantity(): number {
		return this.quantity;
	}

	setQuantity(value: number) {
		this.quantity = value;
	}

	getPrice(): number {
		return this.price;
	}

	setPrice(value: number) {
		this.price = value;
	}

	getOrder(): Order {
		return this.order;
	}

	setOrder(value: Order) {
		this.order = value;
	}

	getProduct(): Product {
		return this.product;
	}

	setProduct(value: Product) {
		this.product = value;
	}
}