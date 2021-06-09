import { Query, Resolver } from '@nestjs/graphql';
import { TagService } from './tag.service';

@Resolver()
export class TagResolver {
  constructor(private readonly tagService: TagService) {}

  @Query(() => [String])
  async tags() {
    return this.tagService.getTags();
  }
}
