import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { RequestUser } from '@propertyhub/shared';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): RequestUser | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user?: RequestUser }>();
    return request.user;
  },
);
