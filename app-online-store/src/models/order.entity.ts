
import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	ManyToOne,
	OneToMany,
} from "typeorm";
import { User } from "./user.entity";
import { Item } from "./item.entity";


@Entity()
export class Order {

	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	total: number;

	@CreateDateColumn()
	date: Date;

	@ManyToOne(() => User, (user) => user.orders)
	user: User;

	@OneToMany(() => Item, (item) => item.order)
	items: Item[];

	getId():number {
		return this.id;
	}

	setId(value: number) {
		this.id = value;
	}

	getTotal(): number {
		return this.total;
	}

	setTotal(value: number) {
		this.total = value;
	}

	getDate():Date {
		return this.date;
	}

	setDate(value: Date) {
		this.date = value;
	}

	getUser(): User {
		return this.user
	}

	setUser(value: User) {
		this.user = value;
	}

	getItems(): Item[] {
		return this.items;
	}

	setItems(value: Item[]) {
		this.items = value;
	}
}