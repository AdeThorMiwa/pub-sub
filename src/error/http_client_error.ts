import BaseHttpError from "./base_http_error";

/**
 * Exception for requests with invalid parameters.
 */
export class InvalidParamsException extends BaseHttpError {
  constructor(data: any) {
    super('HTTP_ERROR_INVALID_PARAMS', 400, 2, data);
  }
}

/**
 * Exception for entity not found error.
 */
export class UnProcessableEntityException extends BaseHttpError {
  constructor(data: any) {
    super('HTTP_ERROR_ENTITY_NOT_FOUND', 422, 4, data);
  }
}
