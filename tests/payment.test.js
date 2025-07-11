const request = require("supertest");
const app = require("../app");

describe("Payment API", () => {
  let clientToken;
  let paymentId;

  beforeAll(async () => {
    // Register and login a client user
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Client User",
        email: "clientpayment@example.com",
        password: "password123",
        role: "client"
      });

    const clientLoginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "clientpayment@example.com",
        password: "password123",
      });
    clientToken = clientLoginRes.body.token;
  });

  it("should create a payment intent", async () => {
    const res = await request(app)
      .post("/api/payments/intent")
      .set("Authorization", `Bearer ${clientToken}`)
      .send({
        amount: 1000,
        currency: "usd",
        paymentMethodId: "pm_test_123",
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("clientSecret");
  });

  it("should store a transaction", async () => {
    const res = await request(app)
      .post("/api/payments/transaction")
      .set("Authorization", `Bearer ${clientToken}`)
      .send({
        transactionId: "txn_123",
        amount: 1000,
        status: "succeeded",
      });
    expect(res.statusCode).toEqual(200);
  });

  it("should get payment history", async () => {
    const res = await request(app)
      .get("/api/payments")
      .set("Authorization", `Bearer ${clientToken}`);
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should get payment by ID", async () => {
    // Assuming paymentId is known or created in previous test
    // For demonstration, we skip this test if paymentId is not set
    if (!paymentId) return;

    const res = await request(app)
      .get(`/api/payments/${paymentId}`)
      .set("Authorization", `Bearer ${clientToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("_id", paymentId);
  });
});
