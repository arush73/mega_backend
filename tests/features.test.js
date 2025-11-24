import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";

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
const { User } = await import("../src/models/user.models.js");
const { Cohort } = await import("../src/models/cohort.models.js");
const { Profile } = await import("../src/models/profile.models.js");

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

const createTestUser = async (overrides = {}) => {
  const user = await User.create({
    email: "test@example.com",
    username: "testuser",
    password: "Password@123",
    isEmailVerified: true,
    role: "USER",
    ...overrides,
  });
  const accessToken = user.generateAccessToken();
  return { user, accessToken };
};

const createTestCohort = async (overrides = {}) => {
  return await Cohort.create({
    name: "Test Cohort",
    description: "A test cohort",
    startDate: new Date(),
    endDate: new Date(Date.now() + 86400000), // +1 day
    isActive: true,
    ...overrides,
  });
};

describe("Profile Endpoints", () => {
  describe("POST /api/v1/profile", () => {
    it("should create a profile for authenticated user", async () => {
      const { user, accessToken } = await createTestUser();
      const cohort = await createTestCohort();

      const profileData = {
        fullName: "Test User",
        displayName: "Tester",
        pronouns: "HE/HIM/HIS", // Fixed Enum
        title: "Developer",
        bio: "A test bio",
        cohort: cohort._id,
        skills: ["NODE", "REACT"], // Fixed Enum
        roles: ["Developer"],
        experience: [],
        projects: [],
        social: {},
        preferences: {},
        availability: "AVAILABLE", // Fixed Enum
      };

      const res = await request(app)
        .post("/api/v1/profile")
        .set("Authorization", `Bearer ${accessToken}`)
        .set("Cookie", [`accessToken=${accessToken}`])
        .send(profileData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.fullName).toBe(profileData.fullName);
      
      // Verify user is updated with profile
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.profile).toBeDefined();
    });

    it("should fail if not authenticated", async () => {
      const res = await request(app).post("/api/v1/profile").send({});
      expect(res.statusCode).toEqual(401);
    });
  });

  describe("GET /api/v1/profile/:profileId", () => {
    it("should get profile by id", async () => {
      const { user, accessToken } = await createTestUser();
      const cohort = await createTestCohort();
      
      const profile = await Profile.create({
        user: user._id,
        fullName: "Test User",
        displayName: "Tester",
        pronouns: "HE/HIM/HIS",
        title: "Developer",
        bio: "A test bio",
        cohort: cohort._id,
        skills: ["NODE"],
        roles: ["Developer"],
        availability: "AVAILABLE",
      });

      const res = await request(app)
        .get(`/api/v1/profile/${profile._id}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.fullName).toBe("Test User");
    });
  });
});

describe("Cohort Endpoints", () => {
  describe("POST /api/v1/cohort", () => {
    it("should create a cohort (Admin only)", async () => {
      const { accessToken } = await createTestUser({ email: "admin@example.com", username: "admin", role: "ADMIN" });

      const cohortData = {
        name: "New Cohort",
        description: "Description",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000).toISOString(),
        isActive: true,
      };

      const res = await request(app)
        .post("/api/v1/cohort")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(cohortData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.data.name).toBe(cohortData.name);
    });

    it("should fail for non-admin user", async () => {
      const { accessToken } = await createTestUser(); // Default role is USER

      const cohortData = {
        name: "New Cohort",
        description: "Description",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000).toISOString(),
        isActive: true,
      };

      const res = await request(app)
        .post("/api/v1/cohort")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(cohortData);

      expect(res.statusCode).toEqual(401); // Or 403 depending on implementation, usually 401 for unauthorized role in this middleware
    });
  });

  describe("GET /api/v1/cohort", () => {
    it("should list cohorts (Admin only)", async () => {
      const { accessToken } = await createTestUser({ email: "admin@example.com", username: "admin", role: "ADMIN" });
      
      // Manually create cohorts in DB
      await createTestCohort({ name: "Cohort 1" });
      await createTestCohort({ name: "Cohort 2" });

      const res = await request(app)
        .get("/api/v1/cohort")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });
  });
});
