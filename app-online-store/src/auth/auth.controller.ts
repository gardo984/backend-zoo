

import {
	Controller,
	Get, Post,
	Render, Body,
	Redirect,
} from "@nestjs/common";
import { User } from "src/models/user.entity";
import { UsersService } from "src/models/users.service";

@Controller('/auth')
export class AuthController {
	constructor(
		private readonly usersService: UsersService
	) {}

	@Get('/register')
	@Render('auth/register')
	async register() {
		const viewData = [];
		viewData['title'] = 'User Register - Online Store';
		viewData['subTitle'] = 'User Register';
		return {
			viewData: viewData,
		}
	}

	@Post('/store')
	@Redirect('/')
	async store(@Body() body) {
		const userInstance = new User();
		userInstance.setName(body.name);
		userInstance.setPassword(body.password);
		userInstance.setEmail(body.email);
		userInstance.setRole('client');
		userInstance.setBalance(1000);
		await this.usersService.createOrUpdateUser(userInstance);
	}
}