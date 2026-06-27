import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';


@Global()
@Module({
	providers: [
		{
			provide: RedisService,
			useFactory: () => {
				return new RedisService({
					host: process.env.REDIS_HOST || 'localhost',
					port: parseInt(process.env.REDIS_PORT || '6379', 10),
					password: process.env.REDIS_PASSWORD || undefined,
				});
			},
		},
	],
	exports: [RedisService],
})
export class RedisModule {}
