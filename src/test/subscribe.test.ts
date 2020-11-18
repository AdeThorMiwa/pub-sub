import supertest from "supertest";

import initDB from "./../initDB";
initDB()

import app from "./../app";

const topic = "interviews";
const route = `/subscribe/${topic}`;
const url = "http://localhost:8000/event";
const request = supertest(app).post(route).send({ url })

describe('Test Subscription to Topic', () => {
    it("must have a url in the body", async() => {
        const { status } = await supertest(app).post(route)
        expect(status).toBe(400)
    })

    it("has a 201 Response", async() => {
        const { status } = await request
        expect(status).toBe(201)
    })

    it("Was successful and Has Response Data", async () => {
        const { body } = await request;
        expect(body).toEqual(expect.objectContaining({
            status: "success",
            data: expect.any(Object)
        }))
    })

    it("added the new subscription to topic's subscription list", async () => {
        const { body } = await request;
        expect(body.data).toEqual(expect.objectContaining({
            _id: expect.any(String),
            events: expect.any(Array),
            name: topic,
            subscriptions: expect.arrayContaining([
                {
                    topic: expect.any(String),
                    url
                }
            ])
        }))
    })
})
