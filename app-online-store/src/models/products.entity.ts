import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	OneToMany
} from 'typeorm';
import { Item } from './item.entity';


@Entity()
export class Product {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@Column()
	description: string;

	@Column()
	image: string;

	@Column()
	price: number;

	@Column({ length: 200, nullable: true })
	category_description: string;

	@Column({ length: 200, nullable: true })
	author_description: string;

	@Column({ default: true })
	active: boolean;

	@Column({ type: 'int', unsigned: true, nullable: true })
	external_id: number;


	@OneToMany(() => Item, (item) => item.product)
	items: Item[];


	getId(): number {
		return this.id;
	}
	setId(id: number) {
		this.id = id;
	}
	getName(): string {
		return this.name.toUpperCase();
	}
	setName(name: string) {
		this.name = name;
	}
	getDescription(): string {
		return this.description;
	}
	setDescription(description: string) {
		this.description = description;
	}
	getImage(): string {
		return this.image;
	}
	setImage(image: string) {
		this.image = image;
	}
	getPrice(): number {
		return this.price;
	}
	setPrice(price: number) {
		this.price = price;
	}

	getCategoryDescription(): string | null {
		return this.category_description;
	}
	setCategoryDescription(category_description: string | null) {
		this.category_description = category_description;
	}

	getAuthorDescription(): string | null {
		return this.author_description;
	}
	setAuthorDescription(author_description: string | null) {
		this.author_description = author_description;
	}

	isActive(): boolean {
		return this.active;
	}
	setActive(active: boolean) {
		this.active = active;
	}

	getExternalId(): number | null {
		return this.external_id;
	}
	setExternalId(external_id: number | null) {
		this.external_id = external_id;
	}

	getItems(): Item[] {
		return this.items;
	}

	setItems(value: Item[]) {
		this.items = value;
	}

	static sumPricesByQuantities(
		products: Product[], productsInSession
	): number {
		let total = 0;
		for (let index=0; index < products.length; index++) {
			let currentProduct = products[index];
			total += currentProduct.getPrice() * productsInSession[currentProduct.getId()]
		}
		return total;
	}
}