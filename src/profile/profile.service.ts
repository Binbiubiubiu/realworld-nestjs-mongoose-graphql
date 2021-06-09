import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserInputError } from 'apollo-server-express';
import { Model, Types } from 'mongoose';
import { UserService } from '../user/user.service';
import { Profile, ProfileDocument } from './schemas/profile.schema';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(Profile.name)
    private readonly profileModel: Model<ProfileDocument>,
    private readonly userService: UserService,
  ) {}

  async follow(userId: string, username: string) {
    const currentUser = await this.userService.getUserById(userId);
    if (currentUser.username === username) {
      throw new UserInputError("You can't follow yourself");
    }
    const user = await this.userService.getUserByUsername(username);

    try {
      await new this.profileModel({
        followor: Types.ObjectId(userId),
        following: user._id,
      }).save();
    } catch (error) {
      if (error.code !== 11000) {
        throw error;
      }
    }

    return user;
  }

  async unfollow(userId: string, username: string) {
    const user = await this.userService.getUserByUsername(username);

    await this.profileModel.deleteOne({
      followor: Types.ObjectId(userId),
      following: user._id,
    });
    return user;
  }

  async getFollowings(userId: string) {
    const followings = await this.profileModel.find({
      followor: Types.ObjectId(userId),
    });
    return followings.map((item) => item.following);
  }

  async isFollowing(followor: string, following: string) {
    if (followor == following) {
      return false;
    }
    return this.profileModel.exists({
      followor: Types.ObjectId(followor),
      following: Types.ObjectId(following),
    });
  }

  async getProfileByUserId(currentUserId: string, userId: string) {
    const user = await this.userService.getUserById(userId);

    return {
      username: user.username,
      bio: user.bio,
      image: user.image,
      following: await this.isFollowing(currentUserId, user._id),
    };
  }
}
