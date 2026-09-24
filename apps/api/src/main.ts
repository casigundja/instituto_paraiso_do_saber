import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { mkdirSync } from 'fs';
import { AppModule } from './app.module';
async function bootstrap(){const app=await NestFactory.create<NestExpressApplication>(AppModule);app.use(helmet({crossOriginResourcePolicy:{policy:'cross-origin'}}));app.enableCors({origin:true,credentials:true});app.setGlobalPrefix('');app.useGlobalPipes(new ValidationPipe({whitelist:true,transform:true}));const uploads=join(process.cwd(),'uploads');mkdirSync(uploads,{recursive:true});app.useStaticAssets(uploads,{prefix:'/media/'});await app.listen(process.env.PORT||4000,'0.0.0.0')}
bootstrap();
