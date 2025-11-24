import request from "supertest";
import app from "../src/app.js";

describe("Health Check Endpoint", () => {
  it("should return 200 OK and a success message", async () => {
    const res = await request(app).get("/api/v1/healthcheck");
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Server is running finee");
  });
});
