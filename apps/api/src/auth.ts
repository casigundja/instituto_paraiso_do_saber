import { CanActivate,ExecutionContext,Injectable,SetMetadata,UnauthorizedException,ForbiddenException,createParamDecorator } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
export const Public=()=>SetMetadata('public',true);
export const Roles=(...roles:string[])=>SetMetadata('roles',roles);
export const CurrentUser=createParamDecorator((_d,ctx:ExecutionContext)=>ctx.switchToHttp().getRequest().user);
@Injectable() export class AuthGuard implements CanActivate {constructor(private jwt:JwtService,private reflector:Reflector){} async canActivate(ctx:ExecutionContext){if(this.reflector.getAllAndOverride('public',[ctx.getHandler(),ctx.getClass()]))return true;const req=ctx.switchToHttp().getRequest<Request&{user:any}>();const token=req.headers.authorization?.replace(/^Bearer /,'');if(!token)throw new UnauthorizedException();try{req.user=await this.jwt.verifyAsync(token)}catch{throw new UnauthorizedException()}const roles=this.reflector.getAllAndOverride<string[]>('roles',[ctx.getHandler(),ctx.getClass()]);if(roles?.length&&!roles.includes(req.user.role))throw new ForbiddenException();return true}}
