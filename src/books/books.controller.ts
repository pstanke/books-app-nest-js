import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { Book } from '@prisma/client';
import { CreateBookDTO } from './dtos/create-book.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('books')
export class BooksController {
  constructor(private booksService: BooksService) {}

  @Get('/')
  public async getAll(): Promise<Book[]> {
    const books = await this.booksService.getAll();
    return books;
  }

  @Get('/:id')
  public async getById(@Param('id', new ParseUUIDPipe()) id: string) {
    const book = await this.booksService.getById(id);
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    return book;
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard)
  public async deleteById(@Param('id', new ParseUUIDPipe()) id: string) {
    if (!(await this.booksService.getById(id))) {
      throw new NotFoundException('Book not found');
    }
    const book = await this.booksService.deleteById(id);
    return book;
  }

  @Post('/')
  @UseGuards(JwtAuthGuard)
  public create(@Body() bookData: CreateBookDTO) {
    return this.booksService.create(bookData);
  }

  @Post('/like/:id')
  @UseGuards(JwtAuthGuard)
  public async bookLike(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Request() req,
  ) {
    const userId = req.user.id;
    const bookId = id;

    if (!(await this.booksService.getById(bookId))) {
      throw new NotFoundException('Book  not found');
    }

    await this.booksService.like(bookId, userId);
    return { success: true };
  }
}
