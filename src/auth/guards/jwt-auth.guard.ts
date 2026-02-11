import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
// Guard that enforces JWT authentication using the configured strategy.
export class JwtAuthGuard extends AuthGuard("jwt") {}
