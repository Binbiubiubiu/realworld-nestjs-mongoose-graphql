import { UpdateUserInput } from './dto/update-user.input';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserInput } from './dto/create-user.input';
import { User, UserDocument } from './schemas/user.schema';
import { UserInputError } from 'apollo-server-express';
import { JwtService } from '@nestjs/jwt';
import { LoginInput } from './dto/login.input';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async updateUser(id: string, updateUserDto: UpdateUserInput) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new UserInputError('user is not exisited');
    }
    const isSamePwd = await user.comparePassword(updateUserDto.password);
    if (isSamePwd) {
      throw new UserInputError(
        'The password cannot be the same as the previous password',
      );
    }
    Object.assign(user, updateUserDto);
    return user.save();
  }

  async validateUser(loginInput: LoginInput) {
    const { username, password } = loginInput;
    const user = await this.vaifyUserByEmailAndPwd(username, password);
    if (!user) {
      throw new UserInputError('Username or Password is not right');
    }
    return {
      ...user.toJSON(),
      token: this.jwtService.sign({
        id: user.id,
      }),
    };
  }

  async vaifyUserByEmailAndPwd(email: string, pass: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UserInputError('email is not exisited');
    }
    const isOkPwd = await user.comparePassword(pass);
    if (user && isOkPwd) {
      return user;
    }
  }

  async registerUser(createUserInput: CreateUserInput) {
    if (await this.exists({ email: createUserInput.email })) {
      throw new UserInputError('user.email is token');
    }

    if (await this.exists({ username: createUserInput.username })) {
      throw new UserInputError('user.username is token');
    }
    const user = await new this.userModel(createUserInput).save();
    return {
      ...user.toJSON(),
      token: this.jwtService.sign({
        id: user.id,
      }),
    };
  }

  async exists(payload: Partial<User>) {
    return this.userModel.exists(payload);
  }

  async getUserById(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new UserInputError('user is not exisited');
    }
    return user;
  }

  async getUserByUsername(username: string) {
    const user = await this.userModel.findOne({ username });
    if (!user) {
      throw new UserInputError('user is not exisited');
    }
    return user;
  }
}
