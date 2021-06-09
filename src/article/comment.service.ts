import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ForbiddenError, UserInputError } from 'apollo-server-express';
import { Model, Types } from 'mongoose';
import { UserService } from '../user/user.service';
import { CreateCommentInput } from './dto/create-comment.input';
import { CommentDocument, Comment } from './schemas/comment.schema';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: Model<CommentDocument>,
    private readonly userService: UserService,
  ) {}

  async createComment(
    slug: string,
    userId: string,
    createCommentDto: CreateCommentInput,
  ) {
    const author = await this.userService.getUserById(userId);
    const comment = new this.commentModel(createCommentDto);
    comment.author = author._id;
    comment.slug = slug;

    return comment.save();
  }

  async deleteComment(id: string, userId: string) {
    const comment = await this.getCommentById(id);

    if (comment.author.toString() !== userId) {
      throw new ForbiddenError('comment is not created by you');
    }
    await this.commentModel.deleteOne({ id: new Types.ObjectId(id) });
    return 'ok';
  }

  async getCommentById(id: string) {
    const comment = await this.commentModel.findById(id);
    if (!comment) {
      throw new UserInputError('comment is not exisited');
    }
    return comment;
  }

  async getComments(slug: string) {
    return this.commentModel.find({ slug });
  }
}
