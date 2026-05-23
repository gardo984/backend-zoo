
import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
} from 'typeorm';


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
}