import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { Observable } from 'rxjs';
import { getRemainingTime } from '../utils/utils';

@Injectable()
export class CookieInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    const { isVisit } = req.signedCookies;
    const { id } = req.params;
    console.log(req.signedCookies);
    console.log(req.cookies, '<<Cookoe');
    console.log(req.headers.cookie, 'headers.cooke');
    console.log(id);
    console.log(isVisit);

    if (!isVisit) {
      console.log('방문한적 없음.');
      res.cookie('isVisit', true, {
        maxAge: getRemainingTime(new Date(Date.now())), // MS
        httpOnly: true, // prevent XSS attacks cross-site scripting attacks
        sameSite: 'lax', // CSRF attacks cross-site request forgery attacks
        secure: process.env.NODE_ENV !== 'development',
        signed: true,
        // path: '/',
        //& path 시도 해 보자
      });
    }

    req.isVisited = isVisit ? true : false;

    return next.handle();
  }
}
