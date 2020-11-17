/**
 * General Module Imports
 */
import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";

/**
 * Route Imports
 */
import publishRoute from "./routes/publish.route"
import subscribeRoute from "./routes/subscribe.route"
import eventRoute from "./routes/event.route";

/**
 * Error handler Imports
 */
import globalErrorHandler from "./controllers/error.controller";
import { NotImplementedMethodException } from "./error/http_server_error";

/**
 * Initialize a new `express` app
 */
const app = express();

/**
 * Initialize general `middleWares`
 */
app.use(cors());
app.use(bodyParser.json());

/**
 * API root 
 * @param req an `express` request object
 * @param res an `express` response object
 */
app.get("/", (req: Request, res: Response) => {
    res.json({
        status: "success",
        message: `PUB/SUB App is Running...`,
    })
})

/**
 * Mount API route to respective router 
 */
app.use("/publish", publishRoute)
app.use("/subscribe", subscribeRoute)
app.use("/event", eventRoute)

/**
 * Handle any other request that wasn't caught by any router
 * @param req an `express` request object
 * @param res an `express` response object
 * @param next an `express` next function
 */
app.all("*", (req: Request, res: Response, next: any) => {
    return next(new NotImplementedMethodException(null))
});

/**
 * Global Error Handler
 * Handles all exception thrown in the app
 * NOTE: for exception to be caught by this middleware
 * it has to be passed to the next function
 */
app.use(globalErrorHandler);

export default app
