import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "./../src/app.module";

describe("Auth & JWT E2E Tests", () => {
  let app: INestApplication;
  let jwtToken: string;
  let userId: string;
  let postId: string;
  const apiPrefix = "api";
  const apiPath = `/${apiPrefix}`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix(apiPrefix);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("Auth Flow", () => {
    const uniqueSuffix = Date.now();
    const testUser = {
      email: `test.${uniqueSuffix}@example.com`,
      name: "Test User",
      password: "password123",
    };

    it("POST /users - should create a new user", () => {
      return request(app.getHttpServer())
        .post(`${apiPath}/users`)
        .send(testUser)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty("id");
          expect(res.body.email).toBe(testUser.email);
          expect(res.body.name).toBe(testUser.name);
          expect(res.body).not.toHaveProperty("password");
          userId = res.body.id;
        });
    });

    it("POST /auth/login - should login and return JWT token", () => {
      return request(app.getHttpServer())
        .post(`${apiPath}/auth/login`)
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty("access_token");
          expect(res.body).toHaveProperty("user");
          expect(res.body.user.email).toBe(testUser.email);
          jwtToken = res.body.access_token;
        });
    });

    it("POST /auth/login - should fail with invalid credentials", () => {
      return request(app.getHttpServer())
        .post(`${apiPath}/auth/login`)
        .send({
          email: testUser.email,
          password: "wrongpassword",
        })
        .expect(401);
    });
  });

  describe("JWT Protected Routes", () => {
    it("GET /users - should fail without JWT token", () => {
      return request(app.getHttpServer()).get(`${apiPath}/users`).expect(401);
    });

    it("GET /users - should succeed with valid JWT token", () => {
      return request(app.getHttpServer())
        .get(`${apiPath}/users`)
        .set("Authorization", `Bearer ${jwtToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it("GET /users/:id - should get user by id with JWT token", () => {
      return request(app.getHttpServer())
        .get(`${apiPath}/users/${userId}`)
        .set("Authorization", `Bearer ${jwtToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(userId);
          expect(res.body).toHaveProperty("email");
          expect(res.body).not.toHaveProperty("password");
        });
    });

    it("POST /posts - should fail without JWT token", () => {
      return request(app.getHttpServer())
        .post(`${apiPath}/posts`)
        .send({
          title: "Test Post",
          content: "This is a test post",
        })
        .expect(401);
    });

    it("POST /posts - should create post with valid JWT token", () => {
      return request(app.getHttpServer())
        .post(`${apiPath}/posts`)
        .set("Authorization", `Bearer ${jwtToken}`)
        .send({
          title: "Test Post",
          content: "This is a test post",
          published: true,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty("id");
          expect(res.body.title).toBe("Test Post");
          expect(res.body.userId).toBe(userId);
          postId = res.body.id;
        });
    });

    it("GET /posts - should get all posts without authentication", () => {
      return request(app.getHttpServer())
        .get(`${apiPath}/posts`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0) {
            expect(res.body[0]).toHaveProperty("user");
            expect(res.body[0].user).not.toHaveProperty("password");
          }
        });
    });

    it("PATCH /posts/:id - should update post with valid JWT token", () => {
      return request(app.getHttpServer())
        .patch(`${apiPath}/posts/${postId}`)
        .set("Authorization", `Bearer ${jwtToken}`)
        .send({
          title: "Updated Test Post",
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toBe("Updated Test Post");
        });
    });

    it("DELETE /posts/:id - should delete post with valid JWT token", () => {
      return request(app.getHttpServer())
        .delete(`${apiPath}/posts/${postId}`)
        .set("Authorization", `Bearer ${jwtToken}`)
        .expect(200);
    });

    it("GET /posts/:id - should return 404 for deleted post", () => {
      return request(app.getHttpServer())
        .get(`${apiPath}/posts/${postId}`)
        .expect(404);
    });
  });

  describe("JWT Token Validation", () => {
    it("Should reject invalid JWT token", () => {
      return request(app.getHttpServer())
        .get(`${apiPath}/users`)
        .set("Authorization", "Bearer invalid_token_here")
        .expect(401);
    });

    it("Should reject expired or malformed JWT token", () => {
      return request(app.getHttpServer())
        .get(`${apiPath}/users`)
        .set(
          "Authorization",
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid",
        )
        .expect(401);
    });

    it("Should reject request without Bearer prefix", () => {
      return request(app.getHttpServer())
        .get(`${apiPath}/users`)
        .set("Authorization", jwtToken)
        .expect(401);
    });
  });
});
