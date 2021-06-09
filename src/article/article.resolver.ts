import { UseGuards } from '@nestjs/common';
import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CurrentUserId } from '../decorators/current-user-id.decorator';
import { ProfileService } from '../profile/profile.service';
import { JwtAuthGuard } from '../user/guards/jwt-auth.guard';
import { Author } from '../profile/schemas/profile.schema';
import { ArticleService } from './article.service';
import { CreateArticleInput } from './dto/create-article.input';
import {
  PaginationInput,
  QueryArticleInput,
  QueryArticleOutput,
} from './dto/query-article.input';
import { UpdateArticleInput } from './dto/update-article.input';
import { Article, ArticleDocument } from './schemas/article.schema';
import { FavoritedService } from './favorite.service';

@UseGuards(JwtAuthGuard)
@Resolver(() => Article)
export class ArticleResolver {
  constructor(
    private readonly articleService: ArticleService,
    private readonly profileService: ProfileService,
    private readonly favoriteService: FavoritedService,
  ) {}

  @Mutation(() => Article)
  async createArticle(
    @CurrentUserId() currentUserId: string,
    @Args('article') createArticleDto: CreateArticleInput,
  ) {
    return this.articleService.createArticle(currentUserId, createArticleDto);
  }

  @Mutation(() => Article)
  async updateArticle(
    @CurrentUserId() currentUserId: string,
    @Args('slug') slug: string,
    @Args('article') updateArticleInput: UpdateArticleInput,
  ) {
    return this.articleService.updateArticle(
      slug,
      currentUserId,
      updateArticleInput,
    );
  }

  @Mutation(() => String)
  async DeleteArticle(
    @Args('slug') slug: string,
    @CurrentUserId() currentUserId: string,
  ) {
    return this.articleService.deleteArticle(slug, currentUserId);
  }

  @Query(() => QueryArticleOutput)
  async getRecentArticlesGlobally(
    @Args('article') queryArticleDto: QueryArticleInput,
  ) {
    return {
      articles: await this.articleService.getArticles(queryArticleDto),
      articlesCount: await this.articleService.getArticlesCount(
        queryArticleDto,
      ),
    };
  }

  @Query(() => QueryArticleOutput)
  async getRecentArticalesFromUsersYouFollow(
    @CurrentUserId() currentUserId: string,
    @Args('article') pagination: PaginationInput,
  ) {
    return {
      articles: await this.articleService.getArticlesByFollowing(
        currentUserId,
        pagination,
      ),
      articlesCount: await this.articleService.getArticlesByFollowingCount(
        currentUserId,
      ),
    };
  }

  @Query(() => Article)
  async article(@Args('slug') slug: string) {
    return this.articleService.getArticleBySlug(slug);
  }

  @Mutation(() => Article)
  async favorite(
    @Args('slug') slug: string,
    @CurrentUserId() currentUserId: string,
  ) {
    return this.favoriteService.favoriteArticle(currentUserId, slug);
  }

  @Mutation(() => Article)
  async unfavorite(
    @Args('slug') slug: string,
    @CurrentUserId() currentUserId: string,
  ) {
    return this.favoriteService.unfavoriteArticle(currentUserId, slug);
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

  @ResolveField(() => Int)
  async favoritesCount(@Parent() artcile: ArticleDocument) {
    return this.favoriteService.getArticleFavoritesCount(artcile.id);
  }

  @ResolveField(() => Boolean)
  async favorited(
    @Parent() artcile: ArticleDocument,
    @CurrentUserId() currentUserId: string,
  ) {
    return this.favoriteService.getArticleFavorited(currentUserId, artcile.id);
  }
}
