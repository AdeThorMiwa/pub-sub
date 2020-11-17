import { Request, Response } from "express";
import catcher from "./../utils/catcher";
import MemoryDB from "./../persistence/MemoryDB";
import dispatcher from "./../utils/dispatcher";
import { InvalidParamsException, UnProcessableEntityException } from "./../error/http_client_error";

/**
 * Initialize topic collection
 */
const TopicCollection = MemoryDB.collection("Topic")

/**
 * This controller handles publish an event to a topic
 * @param topic a `req.params` property of the topic to publish event to
 * @param message a `req.body` property of the message body of the event to be published
 */
export const publish = catcher(async (req: Request, res: Response, next: any) => {
    /**
     * get topic if exist
     */
    let topic: any = TopicCollection.getByName(req.params.topic)

    /**
     * if topic doesn't exist
     */
    if(!topic) {

        /**
         * return a topic not found exception
         */
        return next(
            new UnProcessableEntityException(`Topic \`${req.params.topic}\` does not exist`)
        )
    }

    /**
     * if it exist
     * check if there's a `req.body.message`
     */
    if(!req.body.message) {

        /**
         * return a invalid param exception
         */
        return next(new InvalidParamsException(`Message cannot be empty.`))
    }

    /**
     * create new event
     */
    const event: TopicEvent = {
        message: req.body.message,
        topic: topic._id
    }

    /**
     * add event to topic's event list
     */
    topic.addEvent(event);

    /**
     * dispatch Event to all subscribers
     * get all topic's subscribers
     */
    const subscribersUrl = topic.getAllSubscribersUrl();

    /**
     * dispatch event
     */
    subscribersUrl.forEach(
        (url: string) => dispatcher(url, event)
    )

    /**
     * return a success status
     */
    res.status(201).json({
        status: "success",
    })
})