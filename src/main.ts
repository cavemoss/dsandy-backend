import { NestFactory } from '@nestjs/core';
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  dayjs.extend(utc);
  dayjs.extend(timezone);

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
