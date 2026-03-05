import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * v0.5.0 — Input Validation Pipeline: ValidationExceptionFilter
 *
 * Custom exception filter to format validation errors consistently.
 * Catches BadRequestException (thrown by ValidationPipe) and transforms
 * the response to include field-level constraint details.
 *
 * Response format:
 * {
 *   "statusCode": 400,
 *   "message": "Bad Request",
 *   "errors": {
 *     "email": ["email must be a valid email address"],
 *     "password": ["password must be at least 1 character"]
 *   },
 *   "timestamp": "2026-03-05T12:34:56.789Z"
 * }
 *
 * VULN (Intentional):
 *   - CWE-209 (Information Exposure): Field-level errors exposed to client
 *     (useful for legitimate users, exploitable for reconnaissance)
 */
@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const exceptionResponse = exception.getResponse();

    // Extract error details from ValidationPipe response
    const errors: Record<string, string[]> = {};
    if (
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse &&
      Array.isArray(exceptionResponse.message)
    ) {
      // ValidationPipe returns: { message: ["field: constraint", ...], statusCode, error }
      exceptionResponse.message.forEach((msg: string) => {
        // Parse messages like "email: must be a valid email address"
        const parts = msg.split(': ');
        if (parts.length >= 2) {
          const field = parts[0];
          const constraint = parts.slice(1).join(': ');
          if (!errors[field]) {
            errors[field] = [];
          }
          if (!errors[field].includes(constraint)) {
            errors[field].push(constraint);
          }
        }
      });
    }

    const statusCode = exception.getStatus();
    const now = new Date().toISOString();

    response.status(statusCode).json({
      statusCode,
      message: 'Bad Request',
      errors: Object.keys(errors).length > 0 ? errors : undefined,
      timestamp: now,
    });
  }
}
