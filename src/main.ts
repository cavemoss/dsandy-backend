import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  const config = new DocumentBuilder()
    .setTitle('AliExpress Scraper API')
    .setDescription('API for managing scraped AliExpress products and images')
    .setVersion('1.0')
    .addTag('products', 'Endpoints for product data')
    .addServer('http://localhost:3000', 'Local environment')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.enableCors({
    origin: (origin: string, callback: (...args: any[]) => void) => {
      if (
        !origin ||
        /^https?:\/\/([a-z0-9-]+\.)*dsandy\.shop$/.test(origin) ||
        /http:\/\/localhost:\d+/.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3001);
}

void bootstrap();
