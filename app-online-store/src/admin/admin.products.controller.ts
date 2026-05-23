
import {
	Render,
	Get,
	Controller,
	Post,
	Body,
	Redirect,
	UseInterceptors,
	UploadedFile,
	Param,
	NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { ProductsService } from 'src/models/products.service';
import { Product } from '../models/products.entity';


@Controller('/admin/products')
export class AdminProductsController {
	constructor(private readonly productsService: ProductsService) {}

	@Get('/')
	@Render('admin/products/index')
	async index() {
		const viewData = [];
		viewData['title'] = 'Admin Page - Admin - Online Store';
		viewData['products'] = await this.productsService.findAll();
		return {
			viewData: viewData,
		}
	}

	@Post('/store')
	@UseInterceptors(FileInterceptor('image', { dest: './public/uploads' }))
	@Redirect('/admin/products')
	async store(@Body() body, @UploadedFile() file: Express.Multer.File) {
		/*console.log(`fields: ${Object.getOwnPropertyNames(file)}`)*/
		const newProduct = new Product();
		newProduct.setName(body.name);
		newProduct.setDescription(body.description);
		newProduct.setPrice(body.price);
		newProduct.setImage(file.filename);
		await this.productsService.createOrUpdate(newProduct);
	}

	@Post('/:id')
	@Redirect('/admin/products')
	async remove(@Param('id') productId: string) {
		return this.productsService.remove(productId);
	}

	@Get('/:id')
	@Render('admin/products/edit')
	async edit(@Param() params) {
		const viewData = [];
		viewData['title'] = 'Admin Page - Edit Product - Online Store';
		viewData['product'] = await this.productsService.findOne(params.id);
		return {
			viewData: viewData,
		}
	}

	@Post('/:id/update')
	@UseInterceptors(FileInterceptor('image', { dest: './public/uploads' }))
	@Redirect('/admin/products')
	async update(
		@Body() body,
		@UploadedFile() file: Express.Multer.File,
		@Param() params
	) {
		const productInstance = await this.productsService.findOne(params.id);
		if (!productInstance) {
 			throw new NotFoundException(`Product with ID ${params.id} not found`);
		}
		productInstance?.setName(body.name);
		productInstance?.setDescription(body.description);
		productInstance?.setPrice(body.price);
		if (file) {
			productInstance?.setImage(file.filename);	
		}
		await this.productsService.createOrUpdate(productInstance);

	}
}