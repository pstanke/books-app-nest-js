import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Book } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BooksService {
  constructor(private prismaService: PrismaService) {}

  public getAll(): Promise<Book[]> {
    return this.prismaService.book.findMany({
      include: { author: true },
    });
  }

  public getById(id: Book['id']): Promise<Book | null> {
    return this.prismaService.book.findUnique({
      where: { id },
      include: { author: true },
    });
  }

  public deleteById(id: Book['id']): Promise<Book> {
    return this.prismaService.book.delete({
      where: { id },
    });
  }

  public async create(
    bookData: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Book> {
    const { authorId, ...otherData } = bookData;
    try {
      return await this.prismaService.book.create({
        data: {
          ...otherData,
          author: {
            connect: { id: authorId },
          },
        },
      });
    } catch (err) {
      if (err.code === 'P2002') {
        throw new ConflictException('Title is already taken');
      }
      if (err.code === 'P2025') {
        throw new BadRequestException("Author doesn't exist");
      }
      throw err;
    }
  }

  public async updateById(
    id: Book['id'],
    bookData: Omit<Book, 'id'>,
  ): Promise<Book> {
    const { authorId, ...otherData } = bookData;
    try {
      return await this.prismaService.book.update({
        where: { id },
        data: {
          ...otherData,
          author: {
            connect: { id: authorId },
          },
        },
      });
    } catch (err) {
      if (err.code === 'P2002') {
        throw new ConflictException('Title is already taken');
      }
      if (err.code === 'P2025') {
        throw new BadRequestException("Author doesn't exist");
      }
      throw err;
    }
  }
}
