import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { AuthUser } from "../common/types/auth-user.type";
import * as bcrypt from "bcrypt";

type LoginUser = {
  id: string;
  email: string;
  name: string;
};

type JwtPayload = {
  email: string;
  sub: string;
};

type LoginResponse = {
  access_token: string;
  user: LoginUser;
};

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<LoginUser> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Compare raw password with stored bcrypt hash
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }

  async login(user: LoginUser): Promise<LoginResponse> {
    // Standard JWT payload: subject = user id
    const payload = { email: user.email, sub: user.id };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async validateToken(payload: JwtPayload): Promise<AuthUser> {
    // Token is valid only if the user still exists
    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException();
    }

    return { userId: user.id, email: user.email };
  }
}
