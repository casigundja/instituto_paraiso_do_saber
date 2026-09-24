import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { PrismaService } from './prisma.service';
import { AuthGuard } from './auth';
@Module({imports:[ConfigModule.forRoot({isGlobal:true}),JwtModule.register({global:true,secret:process.env.JWT_SECRET||'dev-only-change-me',signOptions:{expiresIn:'12h'}})],controllers:[AppController],providers:[PrismaService,{provide:APP_GUARD,useClass:AuthGuard}]}) export class AppModule{}
