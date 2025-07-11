const request = require("supertest");
const app = require("../app");

describe("Notification API", () => {
  let userToken;
  let notificationId;

  beforeAll(async () => {
    // Register and login a user
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Notification User",
        email: "notificationuser@example.com",
        password: "password123",
        role: "user"
      });

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "notificationuser@example.com",
        password: "password123",
      });
    userToken = loginRes.body.token;
  });

  it("should create a notification", async () => {
    const res = await request(app)
      .post("/api/notifications")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        title: "Test Notification",
        message: "This is a test notification",
        userId: "some-user-id"
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("_id");
    notificationId = res.body._id;
  });

  it("should get all notifications for user", async () => {
    const res = await request(app)
      .get("/api/notifications")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should mark a notification as read", async () => {
    const res = await request(app)
      .patch(`/api/notifications/${notificationId}/read`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("read", true);
  });

  it("should mark all notifications as read", async () => {
    const res = await request(app)
      .patch("/api/notifications/mark-all-read")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.statusCode).toEqual(200);
  });

  it("should delete a notification", async () => {
    const res = await request(app)
      .delete(`/api/notifications/${notificationId}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.statusCode).toEqual(200);
  });
});
