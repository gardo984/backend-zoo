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

@Global()
@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    TypeOrmModule.forFeature([Product, User]),
    AdminModule,
    AuthModule,
    CartModule,
  ],
  controllers: [
    AppController,
    ProductsController,
  ],
  providers: [
    ProductsService,
    UsersService,
  ],
  exports: [
    ProductsService,
    UsersService,
  ]
})
export class AppModule {}
