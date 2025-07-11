const request = require("supertest");
const app = require("../app");

describe("Invoice API", () => {
  let clientToken;
  let invoiceId;

  beforeAll(async () => {
    // Register and login a client user
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Client User",
        email: "clientinvoice@example.com",
        password: "password123",
        role: "client"
      });

    const clientLoginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "clientinvoice@example.com",
        password: "password123",
      });
    clientToken = clientLoginRes.body.token;
  });

  it("should create an invoice", async () => {
    const res = await request(app)
      .post("/api/invoices")
      .set("Authorization", `Bearer ${clientToken}`)
      .send({
        contractId: "some-contract-id",
        amount: 1500,
        dueDate: "2024-12-31",
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("_id");
    invoiceId = res.body._id;
  });

  it("should get all invoices for user", async () => {
    const res = await request(app)
      .get("/api/invoices")
      .set("Authorization", `Bearer ${clientToken}`);
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should get invoice by ID", async () => {
    const res = await request(app)
      .get(`/api/invoices/${invoiceId}`)
      .set("Authorization", `Bearer ${clientToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("_id", invoiceId);
  });

  it("should mark invoice as paid", async () => {
    const res = await request(app)
      .patch(`/api/invoices/${invoiceId}/pay`)
      .set("Authorization", `Bearer ${clientToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("paid", true);
  });

  it("should create stripe payment intent", async () => {
    const res = await request(app)
      .post("/api/invoices/create-payment-intent")
      .set("Authorization", `Bearer ${clientToken}`)
      .send({
        invoiceId: invoiceId,
        paymentMethodId: "pm_test_123",
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("clientSecret");
  });

  it("should generate invoice PDF", async () => {
    const res = await request(app)
      .get(`/api/invoices/${invoiceId}/pdf`)
      .set("Authorization", `Bearer ${clientToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.headers["content-type"]).toEqual("application/pdf");
  });

  it("should delete invoice", async () => {
    const res = await request(app)
      .delete(`/api/invoices/${invoiceId}`)
      .set("Authorization", `Bearer ${clientToken}`);
    expect(res.statusCode).toEqual(200);
  });
});
