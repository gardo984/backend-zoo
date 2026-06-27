import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';


async function bootstrap() {
	const logger = new Logger('Bootstrap');

	const app = await NestFactory.createApplicationContext(AppModule, {
		logger: ['log', 'error', 'warn', 'debug', 'verbose'],
	});

	logger.log('Worker started — listening for book events via Redis pub/sub');

	// Keep the process alive until explicitly shut down
	process.on('SIGINT', async () => {
		logger.log('Shutting down worker...');
		await app.close();
		process.exit(0);
	});

	process.on('SIGTERM', async () => {
		logger.log('Shutting down worker...');
		await app.close();
		process.exit(0);
	});
}
bootstrap();
