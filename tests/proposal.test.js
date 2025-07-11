const request = require("supertest");
const app = require("../app");

describe("Proposal API", () => {
  let freelancerToken;
  let clientToken;
  let jobId;
  let proposalId;

  beforeAll(async () => {
    // Register and login a client user to create a job
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Client User",
        email: "clientproposal@example.com",
        password: "password123",
        role: "client"
      });

    const clientLoginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "clientproposal@example.com",
        password: "password123",
      });
    clientToken = clientLoginRes.body.token;

    // Create a job
    const jobRes = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${clientToken}`)
      .send({
        title: "Job for Proposal",
        description: "Job description",
        budget: 2000,
      });
    jobId = jobRes.body._id;

    // Register and login a freelancer user
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Freelancer User",
        email: "freelancer@example.com",
        password: "password123",
        role: "freelancer"
      });

    const freelancerLoginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "freelancer@example.com",
        password: "password123",
      });
    freelancerToken = freelancerLoginRes.body.token;
  });

  it("freelancer should submit a proposal", async () => {
    const res = await request(app)
      .post(`/api/proposals/${jobId}`)
      .set("Authorization", `Bearer ${freelancerToken}`)
      .send({
        coverLetter: "I am interested in this job.",
        proposedBudget: 1800,
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("_id");
    proposalId = res.body._id;
  });

  it("client should get proposals for job", async () => {
    const res = await request(app)
      .get(`/api/proposals/job/${jobId}`)
      .set("Authorization", `Bearer ${clientToken}`);
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("freelancer should get own proposals", async () => {
    const res = await request(app)
      .get("/api/proposals/me")
      .set("Authorization", `Bearer ${freelancerToken}`);
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("client should respond to proposal", async () => {
    const res = await request(app)
      .put(`/api/proposals/${proposalId}/respond`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ status: "accepted" });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("status", "accepted");
  });

  it("should delete proposal", async () => {
    const res = await request(app)
      .delete(`/api/proposals/${proposalId}`)
      .set("Authorization", `Bearer ${freelancerToken}`);
    expect(res.statusCode).toEqual(200);
  });
});
