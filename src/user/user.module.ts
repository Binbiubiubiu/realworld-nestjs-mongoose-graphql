import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { AuthResolver } from './auth.resolver';
import { User, UserSchema } from './schemas/user.schema';
import { jwtConstants } from './guards/constants';
import { JwtStrategy } from './guards/jwt.strategy';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '24h' },
    }),
  ],
  providers: [UserResolver, AuthResolver, UserService, JwtStrategy],
  exports: [UserService],
})
export class UserModule {}
