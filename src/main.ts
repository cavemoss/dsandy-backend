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
    origin: 'http://localhost:3000', // Allow your frontend origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed HTTP methods
    credentials: true, // Allow cookies or authentication headers
  });

  await app.listen(process.env.PORT ?? 3001);
}

void bootstrap();
