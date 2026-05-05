import { Injectable } from '@nestjs/common';
import { Prisma, Todo } from '@prisma/client';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  list(): Promise<Todo[]> {
    return this.prisma.todo.findMany();
  }

  create(data: Prisma.TodoCreateInput): Promise<Todo> {
    return this.prisma.todo.create({
      data,
    });
  }

  delete(id: number): Promise<Todo> {
    return this.prisma.todo.delete({
      where: {
        id,
      },
    });
  }

  deleteAll() {
    return this.prisma.todo.deleteMany({});
  }

  update(id, data: Prisma.TodoUpdateInput): Promise<Todo> {
    return this.prisma.todo.update({
      where: {
        id,
      },
      data,
    });
  }
}
