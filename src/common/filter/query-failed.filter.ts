import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class QueryFailedExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const req = host.switchToHttp().getRequest();
    const res = host.switchToHttp().getResponse();

    const status = 500;
    let message = '데이터 베이스 오류 발생';
    console.warn(exception.message);

    if (exception.message.includes('duplicate key')) message = '중복 키 에러!';

    res.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: req.path,
      message,
      // path: req.url,
    });
  }
}
