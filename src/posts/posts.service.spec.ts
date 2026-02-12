// Unit tests for PostsService.

import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { PostsService } from "./posts.service";
import { Post } from "./entities/post.entity";

const mockPostsRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

describe("PostsService", () => {
  let service: PostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getRepositoryToken(Post),
          useValue: mockPostsRepository,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    jest.clearAllMocks();
  });

  it("create - saves a post for the given user", async () => {
    // Arrange: create returns the input data and save returns the saved post.
    mockPostsRepository.create.mockImplementation((data: Post) => data);
    mockPostsRepository.save.mockResolvedValue({ id: "post-id" });

    // Act: create a post for user.
    const result = await service.create(
      { title: "Title", content: "Body", published: true },
      "user-id",
    );

    // Assert: post was saved and returned.
    expect(mockPostsRepository.save).toHaveBeenCalled();
    expect(result.id).toBe("post-id");
  });

  it("findAll - returns posts with user relation", async () => {
    // Arrange: repository returns a list.
    mockPostsRepository.find.mockResolvedValue([{ id: "1" }]);

    // Act: fetch all posts.
    const result = await service.findAll();

    // Assert: list is returned.
    expect(result).toHaveLength(1);
  });

  it("findOne - returns a post when found", async () => {
    // Arrange: repository returns a post.
    mockPostsRepository.findOne.mockResolvedValue({ id: "1" });

    // Act: fetch by id.
    const result = await service.findOne("1");

    // Assert: post is returned.
    expect(result.id).toBe("1");
  });

  it("findOne - throws not found when missing", async () => {
    // Arrange: repository returns null.
    mockPostsRepository.findOne.mockResolvedValue(null);

    // Act + Assert: should throw NotFoundException.
    await expect(service.findOne("missing")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("findByUserId - returns posts for a user", async () => {
    // Arrange: repository returns user posts.
    mockPostsRepository.find.mockResolvedValue([{ id: "1" }]);

    // Act: fetch posts by user id.
    const result = await service.findByUserId("user-id");

    // Assert: list is returned.
    expect(result).toHaveLength(1);
  });

  it("update - throws forbidden if user is not the owner", async () => {
    // Arrange: post belongs to a different user.
    mockPostsRepository.findOne.mockResolvedValue({ id: "1", userId: "a" });

    // Act + Assert: should throw ForbiddenException.
    await expect(
      service.update("1", { title: "New" }, "b"),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("update - saves when user is owner", async () => {
    // Arrange: post belongs to the same user.
    const existing = { id: "1", userId: "u", title: "Old" } as Post;
    mockPostsRepository.findOne.mockResolvedValue(existing);
    mockPostsRepository.save.mockResolvedValue({ ...existing, title: "New" });

    // Act: update post title.
    const result = await service.update("1", { title: "New" }, "u");

    // Assert: updated post is returned.
    expect(result.title).toBe("New");
  });

  it("remove - throws forbidden if user is not the owner", async () => {
    // Arrange: post belongs to a different user.
    mockPostsRepository.findOne.mockResolvedValue({ id: "1", userId: "a" });

    // Act + Assert: should throw ForbiddenException.
    await expect(service.remove("1", "b")).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it("remove - deletes when user is owner", async () => {
    // Arrange: post belongs to the same user.
    const existing = { id: "1", userId: "u" } as Post;
    mockPostsRepository.findOne.mockResolvedValue(existing);
    mockPostsRepository.remove.mockResolvedValue(existing);

    // Act: delete post.
    await service.remove("1", "u");

    // Assert: remove called with the entity.
    expect(mockPostsRepository.remove).toHaveBeenCalledWith(existing);
  });
});
