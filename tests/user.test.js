const request = require("supertest");
const app = require("../app");

describe("User API", () => {
  let token;

  beforeAll(async () => {
    // Login to get token
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "testuser@example.com",
        password: "password123",
      });
    token = res.body.token;
  });

  it("should get user profile", async () => {
    const res = await request(app)
      .get("/api/users/profile")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("email", "testuser@example.com");
  });
});
