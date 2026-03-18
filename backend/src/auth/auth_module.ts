import { Module } from '@nestjs/common';
import { AuthController } from './auth_controller';

@Module({
  controllers: [AuthController],
})
export class AuthModule {}
