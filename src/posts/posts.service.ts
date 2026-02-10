import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Post } from "./entities/post.entity";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  async create(createPostDto: CreatePostDto, userId: string): Promise<Post> {
    const post = this.postsRepository.create({
      ...createPostDto,
      userId,
    });

    return await this.postsRepository.save(post);
  }

  async findAll(): Promise<Post[]> {
    return await this.postsRepository.find({
      relations: ["user"],
      order: { createdAt: "DESC" },
    });
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ["user"],
    });

    if (!post) {
      throw new NotFoundException("Post not found");
    }

    return post;
  }

  async findByUserId(userId: string): Promise<Post[]> {
    return await this.postsRepository.find({
      where: { userId },
      relations: ["user"],
      order: { createdAt: "DESC" },
    });
  }

  async update(
    id: string,
    updatePostDto: UpdatePostDto,
    userId: string,
  ): Promise<Post> {
    const post = await this.findOne(id);

    if (post.userId !== userId) {
      throw new ForbiddenException("You can only update your own posts");
    }

    Object.assign(post, updatePostDto);

    return await this.postsRepository.save(post);
  }

  async remove(id: string, userId: string): Promise<void> {
    const post = await this.findOne(id);

    if (post.userId !== userId) {
      throw new ForbiddenException("You can only delete your own posts");
    }

    await this.postsRepository.remove(post);
  }
}
