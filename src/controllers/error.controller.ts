import { Request, Response } from "express";
import BaseHttpError from "./../error/base_http_error";

/**
 * This `middleWare` handles all error sent with the `next()` function
 * In this case, all exception thrown in the `app` and the ones
 * that were explicitly passed with calling the `next()` function
 * @param err an error object of type {@link BaseHttpError}
 * @param req an `express` request object
 * @param res an `express` response object
 * @param next an `express` next function
 */
export default (err: BaseHttpError, req: Request, res: Response, next: any) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
    err.errorCode = err.errorCode || 1;
    const message = err.message || 'HTTP_ERROR_DEFAULT';
    err.message = undefined;

    console.error("ERROR 💥", err);

    res.status(err.statusCode).json({
        ...err,
        message
    });
}