import { jest } from "@jest/globals";

// Mock axios before importing app
jest.unstable_mockModule("axios", () => ({
  default: {
    post: jest.fn(),
  },
}));

const { default: request } = await import("supertest");
const { default: axios } = await import("axios");
const { default: app } = await import("../src/app.js");
const { connectTestDB, closeTestDB, clearTestDB } = await import("./setup.js");

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

afterEach(async () => {
  await clearTestDB();
  jest.clearAllMocks();
});

describe("Auth Endpoints", () => {
  const mockUser = {
    email: "test@example.com",
    password: "Password@123",
    username: "testuser",
  };

  describe("POST /api/v1/auth/register", () => {
    it("should register a new user successfully", async () => {
      // Mock axios post for mail service
      axios.post.mockResolvedValue({ data: { success: true } });

      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(mockUser);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(mockUser.email);
      expect(res.body.data).not.toHaveProperty("password");
      
      // Verify mail service was called
      expect(axios.post).toHaveBeenCalled();
    });

    it("should fail if email already exists", async () => {
      // Create user first
      axios.post.mockResolvedValue({ data: { success: true } });
      await request(app).post("/api/v1/auth/register").send(mockUser);

      // Try to create again
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(mockUser);

      expect(res.statusCode).toEqual(409);
      expect(res.body.success).toBe(false);
    });

    it("should fail with invalid email", async () => {
      const invalidUser = { ...mockUser, email: "invalid-email" };
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(invalidUser);

      expect(res.statusCode).toEqual(401); // Validation error
    });
  });

  describe("POST /api/v1/auth/login", () => {
    beforeEach(async () => {
      // Register user before login tests
      axios.post.mockResolvedValue({ data: { success: true } });
      await request(app).post("/api/v1/auth/register").send(mockUser);
    });

    it("should login successfully with correct credentials", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        email: mockUser.email,
        password: mockUser.password,
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(mockUser.email);
      expect(res.headers["set-cookie"]).toBeDefined();
    });

    it("should fail with incorrect password", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        email: mockUser.email,
        password: "wrongpassword",
      });

      expect(res.statusCode).toEqual(400);
    });

    it("should fail with non-existent user", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        email: "nonexistent@example.com",
        password: "Password@123",
      });

      expect(res.statusCode).toEqual(404);
    });
  });
});
