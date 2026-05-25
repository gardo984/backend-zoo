
import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	OneToMany,
} from 'typeorm';
import { Order } from './order.entity';


@Entity()
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@Column({ unique: true })
	email: string;

	@Column()
	password: string;

	@Column()
	role: string;

	@Column()
	balance: number;


	@OneToMany(() => Order, (order) => order.user)
	orders: Order[];


	getId(): number {
		return this.id;
	}

	setId(value: number) {
		this.id = value;
	}

	getName(): string {
		return this.name;
	}

	setName(value: string) {
		this.name = value;
	}

	getEmail(): string {
		return this.email;
	}

	setEmail(value: string) {
		this.email = value;
	}

	getPassword(): string {
		return this.password;
	}

	setPassword(value: string) {
		this.password = value;
	}

	getRole(): string {
		return this.role;
	}

	setRole(value: string) {
		this.role = value;
	}

	getBalance(): number {
		return this.balance;
	}

	setBalance(value: number) {
		this.balance = value;
	}

	getOrders(): Order[] {
		return this.orders;
	}

	setOrder(value: Order[]) {
		this.orders = value;
	}
}