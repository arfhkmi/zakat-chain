import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';

const ADMIN_USERNAME = 'Mudaar_Admin';
const ADMIN_PASSWORD = '123123123';
const ADMIN_TOKEN = 'mudaar-admin-token-zakat-chain';

@Controller('auth')
export class AuthController {
  @Post('login')
  login(@Body() body: { username: string; password: string }) {
    if (body.username === ADMIN_USERNAME && body.password === ADMIN_PASSWORD) {
      return { token: ADMIN_TOKEN };
    }
    throw new UnauthorizedException('Invalid username or password');
  }
}
