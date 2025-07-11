const request = require("supertest");
const app = require("../app");

describe("Review API", () => {
  let userToken;
  let reviewId;
  let userId = "some-user-id"; // Replace with actual user id if needed

  beforeAll(async () => {
    // Register and login a user
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Review User",
        email: "reviewuser@example.com",
        password: "password123",
        role: "user"
      });

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "reviewuser@example.com",
        password: "password123",
      });
    userToken = loginRes.body.token;
  });

  it("should create a review", async () => {
    const res = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        userId: userId,
        rating: 5,
        comment: "Great work!",
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("_id");
    reviewId = res.body._id;
  });

  it("should get reviews for a user", async () => {
    const res = await request(app)
      .get(`/api/reviews/${userId}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should delete a review", async () => {
    const res = await request(app)
      .delete(`/api/reviews/${reviewId}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.statusCode).toEqual(200);
  });
});
