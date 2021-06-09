import { Field, InputType, ObjectType, OmitType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import { User } from '../schemas/user.schema';

@InputType()
export class LoginInput {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  password: string;
}

@ObjectType()
export class LoginSuccess extends User {
  token: string;
}
