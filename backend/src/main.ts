import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const corsUrl = process.env.CORS_URL;

  await app.listen(8080).then(() => {
    if (corsUrl) {
      app.enableCors({
        origin: corsUrl,
      });
      Logger.log(`Cors enabled for ${corsUrl}`);
    } else {
      Logger.log('Cors not enabled');
    }
  });
}

bootstrap();
