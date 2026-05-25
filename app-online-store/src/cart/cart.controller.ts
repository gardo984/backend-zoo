
import {
	Get,
	Post,
	Req,
	Res,
	Controller,
	Body,
	Param,
	Render,
	Redirect,
	Delete,
} from '@nestjs/common';
import { ProductsService } from 'src/models/products.service';
import { Product } from 'src/models/products.entity';
import { OrderService } from 'src/models/order.service';
import { UsersService } from 'src/models/users.service';
import { Item } from 'src/models/item.entity';
import { Order } from 'src/models/order.entity';
import { CircularRelationsError } from 'typeorm';


@Controller('/cart')
export class CartController {
	constructor(
		private readonly productService: ProductsService,
		private readonly orderService: OrderService,
		private readonly userService: UsersService,
	) {}

	@Get('/')
	@Render('cart/index')
	async index(@Req() request) {
		let total = 0;
		let productsInCart: Product[] | null = null;
		const productsInSession = request.session.products;
		if (productsInSession) {
			productsInCart = await this.productService.findByIds(
				Object.keys(productsInSession)
			);
			total = Product.sumPricesByQuantities(productsInCart!, productsInSession);
		}

		const viewData = [];
		viewData['title'] = 'Cart - Online Store';
		viewData['subTitle'] = 'Shopping Cart';
		viewData['total'] = total;
		viewData['productsInCart'] = productsInCart;
		return {
			viewData: viewData,
		}
	}

	@Post('/add/:id')
	@Redirect('/cart')
	async add(@Param('id') productId: number, @Body() body, @Req() request) {
		let productsInSession = request.session.products;
		if (!productsInSession) {
			productsInSession = {};
		}
		productsInSession[productId] = body.quantity;
		request.session.products = productsInSession;
	}

	@Delete('/delete')
	@Redirect('/cart')
	async delete(@Req() request) {
		request.session.products = null;
	}

	@Get('/purchase')
	async purchase(@Req() request, @Res() response) {
		if (!request.session.user) {
			return response.redirect('/auth/login')
		} else if (!request.session.products) {
			return response.redirect('/cart')
		} else {
			const currentUser = await this.userService.findOne(request.session.user.id);
			const productsInSession = request.session.products;
			const productsInCart = await this.productService.findByIds(Object.keys(productsInSession));

			let total = 0;
			const items: Item[] = [];
			for (let index = 0; index < productsInCart.length; index++) {
				const quantity = productsInSession[productsInCart[index].getId()];
				const itemInstance = new Item();
				itemInstance.setQuantity(quantity);
				itemInstance.setPrice(productsInCart[index].getPrice());
				itemInstance.setProduct(productsInCart[index]);
				items.push(itemInstance);
				total += productsInCart[index].getPrice() * quantity;
			}

			const orderPayload = new Order();
			orderPayload.setTotal(total);
			orderPayload.setItems(items);
			orderPayload.setUser(currentUser!);
			const orderInstance = await this.orderService.createOrUpdate(orderPayload);

			const newBalance = currentUser!.getBalance() - total;
			await this.userService.updateBalance(currentUser!.id, newBalance);

			request.session.products = null;
			const viewData = [];
			viewData['title'] = 'Purchase - Online Store';
			viewData['subTitle'] = 'Purchase Status';
			viewData['orderId'] = orderInstance.getId();
			return response.render('cart/purchase', {viewData: viewData})
		}
	}
}