import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, Logger, ClassSerializerInterceptor } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { DecimalSerializerInterceptor } from './common/interceptors/decimal-serializer.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Security headers
  app.use(helmet());

  // Global pipes
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));

  // Global serializer — respects @Exclude() on entities
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
    new DecimalSerializerInterceptor(),
  );

  // Global filters
  app.useGlobalFilters(new AllExceptionsFilter());

  // Cookie parser
  app.use(cookieParser());

  // CORS — restrict to frontend URL only
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3002';
  app.enableCors({ origin: frontendUrl, credentials: true });

  // Swagger (dev only)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('PropertyHub API')
      .setDescription('Platform listing properti fullstack')
      .setVersion('1.3.0')
      .addCookieAuth('token')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    logger.log('📖 Swagger docs: http://localhost:3003/api/docs');
  }

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3003;

  await app.listen(port);
  logger.log(`🚀 Running on: http://localhost:${port}`);
}
bootstrap();
