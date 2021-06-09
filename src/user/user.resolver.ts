import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUserId } from '../decorators/current-user-id.decorator';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './schemas/user.schema';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserService } from './user.service';

@UseGuards(JwtAuthGuard)
@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => User)
  async currentUser(@CurrentUserId() currentUserId: string) {
    return this.userService.getUserById(currentUserId);
  }

  @Mutation(() => User)
  async updateUser(
    @CurrentUserId() currentUserId: string,
    @Args('updateUserInput') payload: UpdateUserInput,
  ) {
    return this.userService.updateUser(currentUserId, payload);
  }
}
