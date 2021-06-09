import { UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CurrentUserId } from '../decorators/current-user-id.decorator';
import { Author } from '../profile/schemas/profile.schema';
import { ProfileService } from '../profile/profile.service';
import { JwtAuthGuard } from '../user/guards/jwt-auth.guard';
import { CommentService } from './comment.service';
import { CreateCommentInput } from './dto/create-comment.input';
import { Article } from './schemas/article.schema';
import { Comment } from './schemas/comment.schema';

@UseGuards(JwtAuthGuard)
@Resolver(() => Comment)
export class CommentResolver {
  constructor(
    private readonly commentService: CommentService,
    private readonly profileService: ProfileService,
  ) {}

  @Mutation(() => Comment)
  async createComment(
    @CurrentUserId() currentUserId: string,
    @Args('slug') slug: string,
    @Args('comment')
    createCommentDto: CreateCommentInput,
  ) {
    return this.commentService.createComment(
      slug,
      currentUserId,
      createCommentDto,
    );
  }

  @Mutation(() => String)
  async deletComment(
    @Args('id') id: string,
    @CurrentUserId() currentUserId: string,
  ) {
    return this.commentService.deleteComment(id, currentUserId);
  }

  @Query(() => [Comment])
  async comments(@Args('slug') slug: string) {
    return this.commentService.getComments(slug);
  }

  @ResolveField(() => Author)
  async author(
    @Parent() artcile: Article,
    @CurrentUserId() currentUserId: string,
  ) {
    return this.profileService.getProfileByUserId(
      currentUserId,
      artcile.author.toString(),
    );
  }
}
