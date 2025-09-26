import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, Query, Patch } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('todos')
@UseGuards(JwtAuthGuard)
export class TodosController {
  constructor(private todosService: TodosService) {}

  @Post()
  create(@GetUser() user: any, @Body() dto: CreateTodoDto) {
    return this.todosService.create(user.userId, dto);
  }

  @Get()
  findAll(@GetUser() user: any) {
    return this.todosService.findAllForUser(user.userId);
  }

  @Get('top-completers')
  // Unprotected or protected? Good to protect: return top users last 7 days
  topCompleters(@Query('days') days?: string, @Query('limit') limit?: string) {
    const d = days ? parseInt(days, 10) : 7;
    const l = limit ? parseInt(limit, 10) : 3;
    return this.todosService.topUsersCompletedTodos(d, l);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser() user: any) {
    return this.todosService.findOne(id, user.userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @GetUser() user: any, @Body() dto: UpdateTodoDto) {
    return this.todosService.update(id, user.userId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: any) {
    return this.todosService.remove(id, user.userId);
  }

  @Get('seed/:userId')
  seedTodos(@Param('userId') userId: string, @Query('count') count?: string) {
    const c = count ? parseInt(count, 10) : 10;
    return this.todosService.seedRandomTodosForUser(userId, c);
    }

}
