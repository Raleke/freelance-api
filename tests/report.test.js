const request = require("supertest");
const app = require("../app");

describe("Report API", () => {
  let userToken;
  let adminToken;

  beforeAll(async () => {
    // Register and login a normal user
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Report User",
        email: "reportuser@example.com",
        password: "password123",
        role: "user"
      });

    const userLoginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "reportuser@example.com",
        password: "password123",
      });
    userToken = userLoginRes.body.token;

    // Register and login an admin user
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Admin User",
        email: "adminuser@example.com",
        password: "password123",
        role: "admin"
      });

    const adminLoginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "adminuser@example.com",
        password: "password123",
      });
    adminToken = adminLoginRes.body.token;
  });

  it("should get user report", async () => {
    const res = await request(app)
      .get("/api/reports/me")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.statusCode).toEqual(200);
  });

  it("should get monthly activity", async () => {
    const res = await request(app)
      .get("/api/reports/activity")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.statusCode).toEqual(200);
  });

  it("admin should get platform overview", async () => {
    const res = await request(app)
      .get("/api/reports/admin/overview")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toEqual(200);
  });

  it("non-admin should not access admin overview", async () => {
    const res = await request(app)
      .get("/api/reports/admin/overview")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.statusCode).toEqual(403);
  });
});
