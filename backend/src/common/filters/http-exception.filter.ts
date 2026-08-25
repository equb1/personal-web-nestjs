import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<Response>();
    const status = exception.getStatus();
    const body = exception.getResponse();
    const message =
      typeof body === 'string'
        ? body
        : (body as { message?: string | string[] }).message;
    res.status(status).json({
      code: status,
      message: Array.isArray(message)
        ? message.join('; ')
        : (message ?? '请求失败'),
      data: null,
    });
  }
}
