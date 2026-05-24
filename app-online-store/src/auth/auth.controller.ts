

import {
	Controller,
	Get, Post,
	Render, Body,
	Redirect,
	Req, Res,
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

	@Get('/login')
	@Render('auth/login')
	async login() {
		const viewData = [];
		viewData['title'] = 'User Login - Online Store';
		viewData['subTitle'] = 'User Login';
		return {
			viewData: viewData,
		}
	}

	@Post('/connect')
	async connect(@Body() body, @Req() request, @Res() response) {
		const email = body.email;
		const passwd = body.password;
		const userInstance = await this.usersService.login(email, passwd);
		if (userInstance) {
			request.session.user = {
				id: userInstance.getId(),
				email: userInstance.getEmail(),
				name: userInstance.getName(),
				role: userInstance.getRole(),
			}
			return response.redirect('/')
		} else {
			return response.redirect('/auth/login');
		}
	}

	@Get('/logout')
	@Redirect('/')
	async logout(@Req() request) {
		request.session.user = null;
	}
}