export class HttpError extends Error {
  constructor(status, message, code, details) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code || 'request_failed';
    this.details = details;
  }
}

export function isHttpError(error) {
  return error instanceof HttpError;
}

