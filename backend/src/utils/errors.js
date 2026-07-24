export class AppError extends Error {
  constructor(code, message, status = 500, details = {}) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
    this.name = 'AppError';
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        status: this.status,
        details: this.details,
      },
    };
  }
}

// Validation errors
export class ValidationError extends AppError {
  constructor(message, details = {}) {
    super('VALIDATION_ERROR', message, 400, details);
  }
}

// Authentication errors
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super('UNAUTHORIZED', message, 401);
  }
}

export class TokenExpiredError extends AppError {
  constructor() {
    super('TOKEN_EXPIRED', 'Your session has expired', 401);
  }
}

// Access errors
export class ForbiddenError extends AppError {
  constructor(message = "You don't have access to this") {
    super('FORBIDDEN', message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super('NOT_FOUND', `${resource} not found`, 404);
  }
}

// Conflict errors
export class ConflictError extends AppError {
  constructor(message, code = 'CONFLICT') {
    super(code, message, 409);
  }
}

// Rate limiting
export class RateLimitError extends AppError {
  constructor(retryAfter = 60) {
    super('RATE_LIMITED', `Too many requests. Try again in ${retryAfter}s`, 429);
  }
}

// Server errors
export class InternalError extends AppError {
  constructor(originalError = null) {
    super('INTERNAL_ERROR', 'Something went wrong', 500);
    if (originalError) {
      console.error('Internal error:', originalError);
    }
  }
}
