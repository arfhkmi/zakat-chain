import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*' });

  const server = app.getHttpServer();
  server.setTimeout(300000); 

  await app.listen(3000);
}
bootstrap();