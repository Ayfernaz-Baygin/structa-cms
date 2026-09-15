import {
  CallHandler,
  ConflictException,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, throwError } from 'rxjs';
import { Prisma } from '../generated/prisma/client.js';

@Injectable()
export class TranslationConflictInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler) {
    return next
      .handle()
      .pipe(
        catchError((error) =>
          throwError(() =>
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
              ? new ConflictException('Slug is already used in this locale.')
              : error,
          ),
        ),
      );
  }
}
