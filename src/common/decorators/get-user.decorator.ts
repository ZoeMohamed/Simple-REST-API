// Custom decorator to access the authenticated user from the request.

import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { AuthUser } from "../types/auth-user.type";

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as AuthUser;
  },
);
