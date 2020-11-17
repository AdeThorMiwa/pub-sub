import { Request, Response } from "express";
import { InternalServerException } from "./../error/http_server_error";

/**
 * A wrapper around `middleWares` for error handling
 * @param fn an async `middleWare` function that takes a {@link Request}, {@link Response} and a next param
 * @returns a middleware function wrapped in a catch block to catch exception in `middleWare`
 */
export default (fn: any) => {
    return (req: Request, res: Response, next: any) => {
        fn(req, res, next).catch((e: any) => next(new InternalServerException(e.message)));
    };
};