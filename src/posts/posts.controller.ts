import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ClassSerializerInterceptor,
  UseInterceptors,
} from "@nestjs/common";
import { PostsService } from "./posts.service";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { GetUser } from "../common/decorators/get-user.decorator";
import { AuthUser } from "../common/types/auth-user.type";

@Controller("posts")
@UseInterceptors(ClassSerializerInterceptor)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createPostDto: CreatePostDto, @GetUser() user: AuthUser) {
    return this.postsService.create(createPostDto, user.userId);
  }

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.postsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get("user/:userId")
  findByUserId(@Param("userId") userId: string) {
    return this.postsService.findByUserId(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updatePostDto: UpdatePostDto,
    @GetUser() user: AuthUser,
  ) {
    return this.postsService.update(id, updatePostDto, user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  remove(@Param("id") id: string, @GetUser() user: AuthUser) {
    return this.postsService.remove(id, user.userId);
  }
}
