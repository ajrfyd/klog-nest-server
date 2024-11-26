import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { JsonWebTokenError } from '@nestjs/jwt';
import { Request, Response } from 'express';

@Catch(JsonWebTokenError)
export class JwtFailedFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const req = host.switchToHttp().getRequest<Request>();

    const status = exception.getStatus();
    console.warn(exception.message);

    res.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: req.path,
      message: exception.message,
      // path: req.baseUrl,
    });
  }
}
