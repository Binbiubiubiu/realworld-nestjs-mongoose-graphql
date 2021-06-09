import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UserService } from './user.service';

import { LoginInput, LoginSuccess } from './dto/login.input';
import { CreateUserInput } from './dto/create-user.input';

@Resolver()
export class AuthResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => LoginSuccess)
  async login(@Args('user') loginInput: LoginInput) {
    return this.userService.validateUser(loginInput);
  }

  @Mutation(() => LoginSuccess)
  async register(@Args('user') createUserInput: CreateUserInput) {
    return this.userService.registerUser(createUserInput);
  }
}
