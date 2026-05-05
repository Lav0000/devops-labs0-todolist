import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Prisma, Todo } from '@prisma/client';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  list(): Promise<Todo[]> {
    return this.appService.list();
  }

  @Post()
  create(@Body() data: Prisma.TodoCreateInput): Promise<Todo> {
    return this.appService.create({
      ...data,
      dueDate: data.dueDate ?? undefined,
    });
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number): Promise<Todo> {
    return this.appService.delete(id);
  }

  @Delete()
  deleteAll() {
    return this.appService.deleteAll();
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Prisma.TodoUpdateInput,
  ): Promise<Todo> {
    return this.appService.update(id, data);
  }
}
