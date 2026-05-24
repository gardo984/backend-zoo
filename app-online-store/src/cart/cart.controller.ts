
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


@Controller('/cart')
export class CartController {
	constructor(
		private readonly productService: ProductsService
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
}