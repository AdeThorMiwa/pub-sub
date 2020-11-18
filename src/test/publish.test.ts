import supertest from "supertest";

import initDB from "./../initDB";
initDB()

import app from "./../app";

const topic = "interviews";
const subscribeUrl = `/subscribe/${topic}`;
const publishUrl = `/publish/${topic}`;
const url = "http://localhost:8000/event"
const message = "The night is still young";
const subscribe = supertest(app).post(subscribeUrl).send({ url })
const publish = supertest(app).post(publishUrl).send({ message })

describe('Test Publish Event to Topic', () => {
    it("Returns 422 status code if topic doesn't exist", async() => {
        const { status } = await supertest(app).post(publishUrl)
        expect(status).toBe(422)
    })

    it("Returns 400 status code if message not found in request body", async() => {
        await subscribe;
        const { status } = await supertest(app).post(publishUrl);
        expect(status).toBe(400)
    })

    it("has a 201 Response", async() => {
        await subscribe;
        const { status } = await publish;
        expect(status).toBe(201)
    })

    test("Status is success", async () => {
        await subscribe;
        const { body } = await publish;
        expect(body).toEqual(expect.objectContaining({
            status: "success",
        }))
    })
})
