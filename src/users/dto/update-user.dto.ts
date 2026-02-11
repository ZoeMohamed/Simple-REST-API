import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateUserDto {
  @ApiPropertyOptional({ example: "Jane Doe" })
  @IsString()
  @IsOptional()
  name?: string;
}
