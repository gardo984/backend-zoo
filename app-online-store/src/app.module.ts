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

import { AuthModule } from './auth/auth.module';
import { UsersService } from './models/users.service';
import { User } from './models/user.entity';
import { CartModule } from './cart/cart.module';
import { Item } from './models/item.entity';
import { Order } from './models/order.entity';
import { OrderService } from './models/order.service';
import { AccountModule } from './account/account.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    TypeOrmModule.forFeature([Product, User, Order, Item]),
    AdminModule,
    AuthModule,
    CartModule,
    AccountModule,
  ],
  controllers: [
    AppController,
    ProductsController,
  ],
  providers: [
    ProductsService,
    UsersService,
    OrderService,
  ],
  exports: [
    ProductsService,
    UsersService,
    OrderService,
  ]
})
export class AppModule {}
