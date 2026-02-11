import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ConflictException, NotFoundException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { UsersService } from "./users.service";
import { User } from "./entities/user.entity";

const mockUsersRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

describe("UsersService", () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it("create - hashes password and saves a new user", async () => {
    // Arrange: no existing user and a mocked hash output.
    const hashSpy = jest
      .spyOn(bcrypt, "hash")
      .mockResolvedValue("hashed" as never);
    mockUsersRepository.findOne.mockResolvedValue(null);
    mockUsersRepository.create.mockImplementation((data: User) => data);
    mockUsersRepository.save.mockResolvedValue({
      id: "user-id",
      email: "test@example.com",
      name: "Test",
      password: "hashed",
    });

    // Act: call create with a raw password.
    const result = await service.create({
      email: "test@example.com",
      name: "Test",
      password: "password123",
    });

    // Assert: password is hashed before save.
    expect(hashSpy).toHaveBeenCalled();
    expect(mockUsersRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ password: "hashed" }),
    );
    expect(result.id).toBe("user-id");
  });

  it("create - throws conflict when email already exists", async () => {
    // Arrange: repository finds an existing user.
    mockUsersRepository.findOne.mockResolvedValue({ id: "existing-id" });

    // Act + Assert: should throw ConflictException.
    await expect(
      service.create({
        email: "test@example.com",
        name: "Test",
        password: "password123",
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("findAll - returns a list of users", async () => {
    // Arrange: repository returns two users.
    mockUsersRepository.find.mockResolvedValue([
      { id: "1", email: "a@example.com" },
      { id: "2", email: "b@example.com" },
    ]);

    // Act: fetch all users.
    const result = await service.findAll();

    // Assert: list contains expected items.
    expect(result).toHaveLength(2);
  });

  it("findOne - returns a user when found", async () => {
    // Arrange: repository returns one user.
    mockUsersRepository.findOne.mockResolvedValue({ id: "1" });

    // Act: fetch by id.
    const result = await service.findOne("1");

    // Assert: user is returned.
    expect(result.id).toBe("1");
  });

  it("findOne - throws not found when user missing", async () => {
    // Arrange: repository returns null.
    mockUsersRepository.findOne.mockResolvedValue(null);

    // Act + Assert: should throw NotFoundException.
    await expect(service.findOne("missing")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("findByEmail - returns a user or null", async () => {
    // Arrange: repository returns a user for the email.
    mockUsersRepository.findOne.mockResolvedValue({ id: "1" });

    // Act: fetch by email.
    const result = await service.findByEmail("a@example.com");

    // Assert: user is returned.
    expect(result).toEqual({ id: "1" });
  });

  it("findById - returns a user or null", async () => {
    // Arrange: repository returns a user for the id.
    mockUsersRepository.findOne.mockResolvedValue({ id: "1", email: "a" });

    // Act: fetch by id.
    const result = await service.findById("1");

    // Assert: user is returned.
    expect(result).toEqual({ id: "1", email: "a" });
  });

  it("update - merges updates and saves", async () => {
    // Arrange: repository returns a user and save resolves.
    const existing = { id: "1", name: "Old" } as User;
    mockUsersRepository.findOne.mockResolvedValue(existing);
    mockUsersRepository.save.mockResolvedValue({ id: "1", name: "New" });

    // Act: update user name.
    const result = await service.update("1", { name: "New" });

    // Assert: saved user contains new name.
    expect(result.name).toBe("New");
  });

  it("remove - deletes a user", async () => {
    // Arrange: repository returns a user and remove resolves.
    const existing = { id: "1" } as User;
    mockUsersRepository.findOne.mockResolvedValue(existing);
    mockUsersRepository.remove.mockResolvedValue(existing);

    // Act: remove the user.
    await service.remove("1");

    // Assert: remove called with the entity.
    expect(mockUsersRepository.remove).toHaveBeenCalledWith(existing);
  });
});
