import supertest from "supertest";
import app from "./../app";

describe("API Root Test", () => {
    it("Has success status and returns PUB/SUB App is Running...", async () => {
        const { body } = await supertest(app).get("/");
        expect(body).toEqual(expect.objectContaining({
            status: "success",
            message: expect.stringMatching("PUB/SUB App is Running...")
        }))
    })
})