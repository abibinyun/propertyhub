import { Controller, Post, Body, Get, Query, Res, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { getConfig } from '../common/config';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private configService: ConfigService) {}

  private get cookieOptions() {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 15 * 60 * 1000, // 15 menit
      path: '/',
    };
  }

  private get refreshCookieOptions() {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: getConfig(this.configService).refreshTokenExpiryDays * 24 * 60 * 60 * 1000,
      path: '/',
    };
  }

  private setAuthCookies(res: Response, token: string, refreshToken: string) {
    res.cookie('token', token, this.cookieOptions);
    res.cookie('refresh_token', refreshToken, this.refreshCookieOptions);
  }

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(dto);
    this.setAuthCookies(res, result.token, result.refreshToken);
    return result;
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto);
    this.setAuthCookies(res, result.token, result.refreshToken);
    return result;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser() user: any, @Res({ passthrough: true }) res: Response) {
    await this.authService.revokeRefreshToken(user.id);
    res.clearCookie('token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
    return { message: 'Logged out' };
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = (req as any).cookies?.refresh_token;
    if (!refreshToken) throw new UnauthorizedException('No refresh token');
    const { accessToken } = await this.authService.refreshAccessToken(refreshToken);
    res.cookie('token', accessToken, this.cookieOptions);
    return { message: 'Token refreshed' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: any) {
    return user;
  }

  @Get('verify-email')
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('resend-verification')
  @UseGuards(JwtAuthGuard)
  resendVerification(@CurrentUser() user: any) {
    return this.authService.resendVerification(user.id);
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.password);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() { /* redirect handled by passport */ }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.googleAuth(req.user as any);
    this.setAuthCookies(res, result.token, result.refreshToken);
    const appUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${appUrl}/dashboard`);
  }
}
