import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post("login")
  async login(@Body() loginDto: LoginDto) {
    // Validate credentials, then return a signed JWT + basic user profile
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    return this.authService.login(user);
  }
}
