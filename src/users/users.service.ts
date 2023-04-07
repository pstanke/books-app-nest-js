import { Injectable, ConflictException } from '@nestjs/common';
import { Password, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  public getAll(): Promise<User[]> {
    return this.prismaService.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
      },
    });
  }

  public getById(id: User['id']): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });
  }
  public async getByEmail(
    email: User['email'],
  ): Promise<(User & { password: Password }) | null> {
    return this.prismaService.user.findUnique({
      where: { email },
      include: { password: true },
    });
  }

  public async create(
    email: User['email'],
    password: Password['hashedPassword'],
  ): Promise<User> {
    try {
      return await this.prismaService.user.create({
        data: {
          email,
          password: {
            create: {
              hashedPassword: password,
            },
          },
        },
      });
    } catch (err) {
      if (err.code === 'P2002') {
        throw new ConflictException('Email is already registered');
      }
      throw err;
    }
  }

  public async updateById(
    id: User['id'],
    userData: Omit<User, 'id'>,
    password?: string | undefined,
  ): Promise<User> {
    if (password === undefined) {
      return await this.prismaService.user.update({
        where: { id },
        data: userData,
      });
    }
    return await this.prismaService.user.update({
      where: { id },
      data: {
        ...userData,
        password: {
          update: {
            hashedPassword: password,
          },
        },
      },
    });
  }

  public deleteById(id: User['id']): Promise<User> {
    return this.prismaService.user.delete({
      where: { id },
    });
  }
}
