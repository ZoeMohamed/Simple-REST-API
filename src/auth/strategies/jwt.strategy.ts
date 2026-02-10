import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "../auth.service";
import { AuthUser } from "../../common/types/auth-user.type";

type JwtPayload = {
  email: string;
  sub: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    const secret = configService.get<string>("JWT_SECRET");
    if (!secret) {
      throw new Error("JWT_SECRET is not set");
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    // Attach user info to request if token is valid
    return await this.authService.validateToken(payload);
  }
}
