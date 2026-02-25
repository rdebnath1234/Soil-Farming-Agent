import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestLoggerMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const startedAt = Date.now();
    this.logger.log(`Incoming request: ${req.method} ${req.originalUrl}`);

    res.on('finish', () => {
      this.logger.log(
        `Completed request: ${req.method} ${req.originalUrl} ${res.statusCode} (${Date.now() - startedAt}ms)`,
      );
    });

    next();
  }
}
