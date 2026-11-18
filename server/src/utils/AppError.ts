import { ErrorCode, ERROR_CODES } from '@smartresume/shared';

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly httpStatus: number;
  public readonly details?: Array<{ path: string; message: string }> | Record<string, unknown>;

  constructor(
    code: ErrorCode,
    httpStatus: number,
    message: string,
    details?: Array<{ path: string; message: string }> | Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.httpStatus = httpStatus;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static badRequest(message: string, details?: Array<{ path: string; message: string }> | Record<string, unknown>) {
    return new AppError(ERROR_CODES.VALIDATION_ERROR, 400, message, details);
  }

  static unauthenticated(message = 'Authentication required') {
    return new AppError(ERROR_CODES.UNAUTHENTICATED, 401, message);
  }

  static tokenExpired(message = 'Token has expired') {
    return new AppError(ERROR_CODES.TOKEN_EXPIRED, 401, message);
  }

  static invalidCredentials(message = 'Invalid email or password') {
    return new AppError(ERROR_CODES.INVALID_CREDENTIALS, 401, message);
  }

  static forbidden(message = 'Access forbidden') {
    return new AppError(ERROR_CODES.FORBIDDEN, 403, message);
  }

  static notFound(message = 'Resource not found') {
    return new AppError(ERROR_CODES.NOT_FOUND, 404, message);
  }

  static conflict(code: ErrorCode, message: string, details?: Record<string, unknown>) {
    return new AppError(code, 409, message, details);
  }

  static tooManyRequests(message = 'Rate limit exceeded') {
    return new AppError(ERROR_CODES.RATE_LIMITED, 429, message);
  }

  static internal(message = 'An unexpected error occurred') {
    return new AppError(ERROR_CODES.INTERNAL_ERROR, 500, message);
  }
}
