import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tag, TagDocument } from './schemas/tag.schema';

@Injectable()
export class TagService {
  constructor(
    @InjectModel(Tag.name) private readonly tagModal: Model<TagDocument>,
  ) {}

  async createTag(name: string) {
    return new this.tagModal({ name }).save().catch((err) => {
      if (err.code !== 11000) {
        throw err;
      }
    });
  }

  async getTags() {
    const tags = await this.tagModal.find();
    return tags != null ? tags.map((tag) => tag.name) : [];
  }
}
