const request = require("supertest");
const app = require("../app");

describe("Organization API", () => {
  let userToken;
  let memberId;
  let organizationId;

  beforeAll(async () => {
    // Register and login a user
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Org User",
        email: "orguser@example.com",
        password: "password123",
        role: "user"
      });

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "orguser@example.com",
        password: "password123",
      });
    userToken = loginRes.body.token;
  });

  it("should create an organization", async () => {
    const res = await request(app)
      .post("/api/orgs")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        name: "Test Organization",
        description: "Organization description",
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("_id");
    organizationId = res.body._id;
  });

  it("should invite a member", async () => {
    const res = await request(app)
      .post("/api/orgs/invite")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        email: "newmember@example.com",
        organizationId: organizationId,
      });
    expect(res.statusCode).toEqual(200);
  });

  it("should get members", async () => {
    const res = await request(app)
      .get("/api/orgs/members")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      memberId = res.body[0]._id;
    }
  });

  it("should remove a member", async () => {
    if (!memberId) return;
    const res = await request(app)
      .delete(`/api/orgs/members/${memberId}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.statusCode).toEqual(200);
  });

  it("should update organization", async () => {
    const res = await request(app)
      .put("/api/orgs")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        name: "Updated Organization Name",
      });
    expect(res.statusCode).toEqual(200);
  });

  it("should leave organization", async () => {
    const res = await request(app)
      .post("/api/orgs/leave")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.statusCode).toEqual(200);
  });
});
