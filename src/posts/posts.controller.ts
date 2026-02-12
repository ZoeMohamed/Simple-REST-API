// Posts API routes.

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
import { ApiBearerAuth, ApiBody, ApiTags } from "@nestjs/swagger";
import { PostsService } from "./posts.service";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { GetUser } from "../common/decorators/get-user.decorator";
import { AuthUser } from "../common/types/auth-user.type";

@ApiTags("Posts")
@Controller("posts")
@UseInterceptors(ClassSerializerInterceptor)
// Posts endpoints with a mix of public reads and JWT-protected writes.
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiBody({ type: CreatePostDto })
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
  @ApiBearerAuth()
  @Get("user/:userId")
  findByUserId(@Param("userId") userId: string) {
    return this.postsService.findByUserId(userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(":id")
  @ApiBody({ type: UpdatePostDto })
  update(
    @Param("id") id: string,
    @Body() updatePostDto: UpdatePostDto,
    @GetUser() user: AuthUser,
  ) {
    return this.postsService.update(id, updatePostDto, user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(":id")
  remove(@Param("id") id: string, @GetUser() user: AuthUser) {
    return this.postsService.remove(id, user.userId);
  }
}
