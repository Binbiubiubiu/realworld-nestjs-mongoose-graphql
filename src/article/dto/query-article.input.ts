import { Article } from '../schemas/article.schema';
import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsNumberString } from 'class-validator';

@InputType()
export class PaginationInput {
  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  offset: number;
}

@InputType()
export class QueryArticleInput extends PaginationInput {
  tag?: string;

  author?: string;

  favorited?: string;
}

@ObjectType()
export class QueryArticleOutput {
  articles: Article[];

  articlesCount: number;
}
