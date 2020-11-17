/**
 * Base HTTP error class.
 * @param message error message to be passed to the `super()` call
 * @param statusCode HTTP status code
 * @param errorCode Request error code
 * @param data Data to be passed in the error response
 */
class BaseHttpError extends Error {

  public status: string;
  public statusCode: number;
  public errorCode: number;
  public data: string;
  public isOperational: boolean;

  constructor(
    message: string,
    statusCode: number, 
    errorCode: number, 
    data: string = null
  ) {
    super(message);
    this.data = data;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.statusCode = statusCode;
    this.errorCode = errorCode;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default BaseHttpError
