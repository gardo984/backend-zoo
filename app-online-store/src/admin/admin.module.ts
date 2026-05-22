
import { AdminController } from "./admin.controller"; 
import { AdminProductsController } from "./admin.products.controller";
import { Module } from "@nestjs/common";


@Module({
	controllers: [AdminController, AdminProductsController,],
})
export class AdminModule {}