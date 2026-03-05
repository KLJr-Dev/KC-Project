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
    const exceptionResponse = exception.getResponse() as any;

    // Extract error details from ValidationPipe response
    const errors: Record<string, string[]> = {};
    
    // NestJS ValidationPipe format: { message: [{ field: "email", messages: ["..."] }, ...] } or { message: ["email: ...", ...] }
    if (Array.isArray(exceptionResponse.message)) {
      console.log('[ValidationExceptionFilter] Message is array, processing...');
      exceptionResponse.message.forEach((msg: any) => {
        if (typeof msg === 'string') {
          // Extract field name from message strings like:
          // - "email is required"
          // - "email must be a valid email address"
          // - "property extraField should not exist"
          // - "email: must be a valid email"
          
          let field: string | null = null;
          
          // Try "property {field}" pattern first (for forbidNonWhitelisted)
          const propertyMatch = msg.match(/^property\s+(\w+)/);
          if (propertyMatch) {
            field = propertyMatch[1];
          } else {
            // Try "field: constraint" or "field constraint" pattern
            const fieldMatch = msg.match(/^(\w+)(?::|$|\s+)/);
            if (fieldMatch) {
              field = fieldMatch[1];
            }
          }
          
          if (field) {
            if (!errors[field]) {
              errors[field] = [];
            }
            // Store the full message, including field name (as tests expect it)
            if (!errors[field].includes(msg)) {
              errors[field].push(msg);
            }
          }
        } else if (typeof msg === 'object' && msg !== null) {
          // Format: { field: "email", messages: ["..."] } or { property: "email", constraints: {...} }
          const field = msg.field || msg.property;
          if (field) {
            if (!errors[field]) {
              errors[field] = [];
            }
            // Handle constraints as object
            if (msg.constraints && typeof msg.constraints === 'object') {
              Object.values(msg.constraints).forEach((constraint: any) => {
                if (!errors[field].includes(String(constraint))) {
                  errors[field].push(String(constraint));
                }
              });
            }
            // Handle messages as array
            if (msg.messages && Array.isArray(msg.messages)) {
              msg.messages.forEach((constraint: any) => {
                if (!errors[field].includes(String(constraint))) {
                  errors[field].push(String(constraint));
                }
              });
            }
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
