/**
 * Error carrying an HTTP status code.
 * Thrown by services and translated to a JSON response by errorHandler.
 */
export class ApiError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}
