const request = require("supertest");
const app = require("../app");

describe("Availability API", () => {
  let userToken;

  beforeAll(async () => {
    // Register and login a user
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Availability User",
        email: "availabilityuser@example.com",
        password: "password123",
        role: "user"
      });

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "availabilityuser@example.com",
        password: "password123",
      });
    userToken = loginRes.body.token;
  });

  it("should set availability", async () => {
    const res = await request(app)
      .post("/api/availability")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        days: ["Monday", "Tuesday"],
        startTime: "09:00",
        endTime: "17:00",
      });
    expect(res.statusCode).toEqual(201);
  });

  it("should get availability", async () => {
    const res = await request(app)
      .get("/api/availability")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.statusCode).toEqual(200);
  });

  it("should export iCal", async () => {
    const res = await request(app)
      .get("/api/availability/ical")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.headers["content-type"]).toContain("text/calendar");
  });

  it("should delete availability", async () => {
    const res = await request(app)
      .delete("/api/availability")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.statusCode).toEqual(200);
  });
});
