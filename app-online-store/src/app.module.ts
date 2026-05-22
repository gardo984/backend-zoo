import { Module, Global } from '@nestjs/common';
import { AppController } from './app.controller';
import { ProductsController } from './products.controller';
import { AdminModule } from './admin/admin.module';
import {
  TypeOrmModule
} from '@nestjs/typeorm';
import { typeOrmConfig } from './typeorm.config';
import { ProductsService } from './models/products.service';
import { Product } from './models/products.entity';
import { TypeORMError } from 'typeorm';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    TypeOrmModule.forFeature([Product,]),
    AdminModule,
  ],
  controllers: [AppController, ProductsController],
  providers: [
    ProductsService,
  ],
  exports: [
    ProductsService,
  ]
})
export class AppModule {}
