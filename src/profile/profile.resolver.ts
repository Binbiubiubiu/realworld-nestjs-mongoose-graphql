import { UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { UserService } from 'src/user/user.service';
import { CurrentUserId } from '../decorators/current-user-id.decorator';
import { JwtAuthGuard } from '../user/guards/jwt-auth.guard';
import { UserDocument } from '../user/schemas/user.schema';
import { Author } from './schemas/profile.schema';
import { ProfileService } from './profile.service';

@UseGuards(JwtAuthGuard)
@Resolver(() => Author)
export class ProfileResolver {
  constructor(
    private readonly profileService: ProfileService,
    private readonly userService: UserService,
  ) {}

  @Mutation(() => Author)
  async follow(
    @CurrentUserId() currentUserId: string,
    @Args('username') username: string,
  ) {
    return this.profileService.follow(currentUserId, username);
  }

  @Mutation(() => Author)
  async unfollow(
    @CurrentUserId() currentUserId: string,
    @Args('username') username: string,
  ) {
    return this.profileService.unfollow(currentUserId, username);
  }

  @Query(() => Author)
  async profile(@Args('username') username: string) {
    return this.userService.getUserByUsername(username);
  }

  @ResolveField('following', () => Boolean)
  async following(
    @Parent() user: UserDocument,
    @CurrentUserId() currentUserId: string,
  ) {
    return this.profileService.isFollowing(currentUserId, user.id);
  }
}
