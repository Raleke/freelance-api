const request = require("supertest");
const app = require("../app");

describe("Contract API", () => {
  let clientToken;
  let freelancerToken;
  let contractId;

  beforeAll(async () => {
    // Register and login a client user
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Client User",
        email: "clientcontract@example.com",
        password: "password123",
        role: "client"
      });

    const clientLoginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "clientcontract@example.com",
        password: "password123",
      });
    clientToken = clientLoginRes.body.token;

    // Register and login a freelancer user
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Freelancer User",
        email: "freelancercontract@example.com",
        password: "password123",
        role: "freelancer"
      });

    const freelancerLoginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "freelancercontract@example.com",
        password: "password123",
      });
    freelancerToken = freelancerLoginRes.body.token;
  });

  it("client should create a contract", async () => {
    const res = await request(app)
      .post("/api/contracts")
      .set("Authorization", `Bearer ${clientToken}`)
      .send({
        title: "Test Contract",
        description: "Contract description",
        budget: 3000,
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("_id");
    contractId = res.body._id;
  });

  it("freelancer should approve the contract", async () => {
    const res = await request(app)
      .patch(`/api/contracts/${contractId}/approve`)
      .set("Authorization", `Bearer ${freelancerToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("status", "approved");
  });

  it("client should update contract status", async () => {
    const res = await request(app)
      .patch(`/api/contracts/${contractId}/status`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ status: "paused" });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("status", "paused");
  });

  it("client should create a milestone for the contract", async () => {
    const res = await request(app)
      .post(`/api/contracts/${contractId}/milestones`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({
        title: "Milestone 1",
        amount: 1000,
        dueDate: "2024-12-31",
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("_id");
  });

  it("user should get all contracts for user", async () => {
    const res = await request(app)
      .get("/api/contracts")
      .set("Authorization", `Bearer ${clientToken}`);
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("user should get single contract", async () => {
    const res = await request(app)
      .get(`/api/contracts/${contractId}`)
      .set("Authorization", `Bearer ${clientToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("_id", contractId);
  });

  it("client should delete contract", async () => {
    const res = await request(app)
      .delete(`/api/contracts/${contractId}`)
      .set("Authorization", `Bearer ${clientToken}`);
    expect(res.statusCode).toEqual(200);
  });
});
