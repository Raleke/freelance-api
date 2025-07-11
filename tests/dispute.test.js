const request = require("supertest");
const app = require("../app");

describe("Dispute API", () => {
  let userToken;
  let adminToken;
  let disputeId;

  beforeAll(async () => {
    // Register and login a normal user
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Dispute User",
        email: "disputeuser@example.com",
        password: "password123",
        role: "user"
      });

    const userLoginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "disputeuser@example.com",
        password: "password123",
      });
    userToken = userLoginRes.body.token;

    // Register and login an admin user
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Admin User",
        email: "admindispute@example.com",
        password: "password123",
        role: "admin"
      });

    const adminLoginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "admindispute@example.com",
        password: "password123",
      });
    adminToken = adminLoginRes.body.token;
  });

  it("user should create a dispute", async () => {
    const res = await request(app)
      .post("/api/disputes")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        title: "Test Dispute",
        description: "Dispute description",
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("_id");
    disputeId = res.body._id;
  });

  it("user should get their disputes", async () => {
    const res = await request(app)
      .get("/api/disputes/my")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("admin should get all disputes", async () => {
    const res = await request(app)
      .get("/api/disputes")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("user should get single dispute", async () => {
    const res = await request(app)
      .get(`/api/disputes/${disputeId}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("_id", disputeId);
  });

  it("admin should update dispute status", async () => {
    const res = await request(app)
      .patch(`/api/disputes/${disputeId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "resolved" });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("status", "resolved");
  });
});
