import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreatePostDto {
  @ApiProperty({ example: "My First Post" })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: "This is the content of my post." })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  published?: boolean;
}
