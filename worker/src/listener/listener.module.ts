import { Module } from '@nestjs/common';
import { ListenerService } from './listener.service';
import { ProductModule } from '../product/product.module';


@Module({
	imports: [ProductModule],
	providers: [ListenerService],
})
export class ListenerModule {}
