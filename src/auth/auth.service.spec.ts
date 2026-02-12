// Unit tests for AuthService.

import { UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { AuthService } from "./auth.service";

const mockUsersService = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
};

describe("AuthService", () => {
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService(mockUsersService as never, mockJwtService as never);
    jest.clearAllMocks();
  });

  it("validateUser - throws if user not found", async () => {
    // Arrange: no user returned by email lookup.
    mockUsersService.findByEmail.mockResolvedValue(null);

    // Act + Assert: should throw UnauthorizedException.
    await expect(
      service.validateUser("test@example.com", "password"),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("validateUser - throws if password is invalid", async () => {
    // Arrange: user exists but password does not match.
    mockUsersService.findByEmail.mockResolvedValue({
      id: "1",
      email: "test@example.com",
      name: "Test",
      password: "hashed",
    });
    jest.spyOn(bcrypt, "compare").mockResolvedValue(false as never);

    // Act + Assert: should throw UnauthorizedException.
    await expect(
      service.validateUser("test@example.com", "password"),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("validateUser - returns minimal user when valid", async () => {
    // Arrange: user exists and password matches.
    mockUsersService.findByEmail.mockResolvedValue({
      id: "1",
      email: "test@example.com",
      name: "Test",
      password: "hashed",
    });
    jest.spyOn(bcrypt, "compare").mockResolvedValue(true as never);

    // Act: validate credentials.
    const result = await service.validateUser("test@example.com", "password");

    // Assert: minimal payload is returned.
    expect(result).toEqual({ id: "1", email: "test@example.com", name: "Test" });
  });

  it("login - signs JWT and returns token + user", async () => {
    // Arrange: jwt service returns a fixed token.
    mockJwtService.sign.mockReturnValue("token");

    // Act: login with a user payload.
    const result = await service.login({
      id: "1",
      email: "test@example.com",
      name: "Test",
    });

    // Assert: access token and user data are returned.
    expect(result.access_token).toBe("token");
    expect(result.user.email).toBe("test@example.com");
  });

  it("validateToken - throws if user no longer exists", async () => {
    // Arrange: user lookup returns null.
    mockUsersService.findById.mockResolvedValue(null);

    // Act + Assert: should throw UnauthorizedException.
    await expect(
      service.validateToken({ email: "test@example.com", sub: "1" }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("validateToken - returns auth user when valid", async () => {
    // Arrange: user lookup returns a user.
    mockUsersService.findById.mockResolvedValue({
      id: "1",
      email: "test@example.com",
    });

    // Act: validate token.
    const result = await service.validateToken({
      email: "test@example.com",
      sub: "1",
    });

    // Assert: auth user is returned.
    expect(result).toEqual({ userId: "1", email: "test@example.com" });
  });
});
