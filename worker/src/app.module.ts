import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from './redis/redis.module';
import { ProductModule } from './product/product.module';
import { ListenerModule } from './listener/listener.module';
import { Product } from './product/product.entity';


@Module({
	imports: [
		TypeOrmModule.forRoot({
			type: 'mariadb',
			host: process.env.DB_HOST || 'localhost',
			port: parseInt(process.env.DB_PORT || '3306', 10),
			username: process.env.DB_USERNAME || 'root',
			password: process.env.DB_PASSWORD || '123456',
			database: process.env.DB_DATABASE || 'dbstore',
			entities: [Product],
			synchronize: true,
		}),
		RedisModule,
		ProductModule,
		ListenerModule,
	],
})
export class AppModule {}
