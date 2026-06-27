import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
} from 'typeorm';


@Entity()
export class Product {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@Column({ nullable: true })
	description: string | null;

	@Column({ nullable: true })
	image: string | null;

	@Column()
	price: number;

	@Column({ length: 200, nullable: true })
	category_description: string | null;

	@Column({ length: 200, nullable: true })
	author_description: string | null;

	@Column({ default: true })
	active: boolean;

	@Column({ type: 'int', unsigned: true, unique: true })
	external_id: number;
}
