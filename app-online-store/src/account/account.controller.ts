import { Controller, Get, Render, Req } from "@nestjs/common";
import { OrderService } from "src/models/order.service";



@Controller('/account')
export class AccountController {

	constructor(
		private readonly orderService: OrderService,
	){}

	@Get('/orders')
	@Render('account/orders')
	async orders(@Req() request) {
		const viewData = {};
		const currentUser = request.session.user;
		Object.assign(viewData, {
			title: 'My Orders - Online Store',
			subtitle: 'My Orders',
			orders: await this.orderService.findByUserId(currentUser.id)
		})
		return {
			viewData: viewData,
		}
	}
}