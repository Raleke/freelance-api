const request = require("supertest");
const app = require("../app");

describe("Job API", () => {
  let clientToken;
  let jobId;

  beforeAll(async () => {
    // Register and login a client user to get token
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Client User",
        email: "clientuser@example.com",
        password: "password123",
        role: "client"
      });

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "clientuser@example.com",
        password: "password123",
      });
    clientToken = loginRes.body.token;
  });

  it("should create a job", async () => {
    const res = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${clientToken}`)
      .send({
        title: "Test Job",
        description: "Job description",
        budget: 1000,
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("_id");
    jobId = res.body._id;
  });

  it("should get all jobs", async () => {
    const res = await request(app)
      .get("/api/jobs")
      .set("Authorization", `Bearer ${clientToken}`);
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should get job by ID", async () => {
    const res = await request(app)
      .get(`/api/jobs/${jobId}`)
      .set("Authorization", `Bearer ${clientToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("_id", jobId);
  });

  it("should update job", async () => {
    const res = await request(app)
      .put(`/api/jobs/${jobId}`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ title: "Updated Job Title" });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("title", "Updated Job Title");
  });

  it("should update job status", async () => {
    const res = await request(app)
      .patch(`/api/jobs/${jobId}/status`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ status: "paused" });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("status", "paused");
  });

  it("should delete job", async () => {
    const res = await request(app)
      .delete(`/api/jobs/${jobId}`)
      .set("Authorization", `Bearer ${clientToken}`);
    expect(res.statusCode).toEqual(200);
  });
});
