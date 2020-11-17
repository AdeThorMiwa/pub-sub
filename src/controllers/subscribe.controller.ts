import { Request, Response } from "express";
import catcher from "./../utils/catcher";
import MemoryDB from "./../persistence/MemoryDB";
import { InvalidParamsException } from "./../error/http_client_error";

/**
 * Initialize topic collection
 */
const TopicCollection = MemoryDB.collection("Topic")

/**
 * This controller handles subscription to a topic
 * @param topic a `req.params` property of the topic to be subscribed to
 * @param url a `req.body` property of the url of subscribing server
 */
export const subscribe = catcher(async (req: Request, res: Response, next: any) => {
    /**
     * get topic if exist
     */
    let topic: any = TopicCollection.getByName(req.params.topic)

    /**
     * if topic doesn't exist
     */
    if(!topic) {

        /**
         * create new topic
         */
        topic = TopicCollection.createOne({
            name: req.params.topic
        })
    }

    /**
     * if it exist
     * check if there's a `req.body.url`
     */
    if(!req.body.url) {

        /**
         * return a invalid param exception
         */
        return next(new InvalidParamsException(`Url cannot be empty.`))
    }

    /**
     * Newly created subscription
     */
    const subscription : Subscription = {
        url: req.body.url,
        topic: topic._id
    }

    /**
     * call the topic subscribe method with the new subscription
     */
    topic.subscribe(subscription)

    /**
     * return topic
     */
    res.status(201).json({
        status: "success",
        data: topic
    })
})