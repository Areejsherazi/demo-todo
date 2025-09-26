import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types ,PipelineStage} from 'mongoose';
import { Todo, TodoDocument } from './schemas/todo.schema';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';


@Injectable()
export class TodosService {
  constructor(@InjectModel(Todo.name) private todoModel: Model<TodoDocument>) {}

  async create(ownerId: string, dto: CreateTodoDto) {
    const doc = new this.todoModel({
      ...dto,
      owner: new Types.ObjectId(ownerId),
      status: dto.status || 'pending',
    });
    return doc.save();
  }

  async findAllForUser(ownerId: string) {
  return this.todoModel.find({ owner: new Types.ObjectId(ownerId) }).exec();
}

    async findOne(id: string, ownerId?: string) {
    const q: any = { _id: new Types.ObjectId(id) };
    if (ownerId) q.owner = new Types.ObjectId(ownerId);
    const todo = await this.todoModel.findOne(q).exec();
    if (!todo) throw new NotFoundException('Todo not found');
    return todo;
    }

    async update(id: string, ownerId: string, dto: UpdateTodoDto) {
    const todo = await this.todoModel.findOne({
        _id: new Types.ObjectId(id),
        owner: new Types.ObjectId(ownerId),
    }).exec();
    if (!todo) throw new NotFoundException('Todo not found');
    Object.assign(todo, dto);
    return todo.save();
    }

    async remove(id: string, ownerId: string) {
    const res = await this.todoModel.findOneAndDelete({
        _id: new Types.ObjectId(id),
        owner: new Types.ObjectId(ownerId),
    }).exec();
    if (!res) throw new NotFoundException('Todo not found');
    return res;
    }

    async seedRandomTodosForUser(userId: string, count = 10) {
  const todos: Partial<Todo>[] = [];   

  for (let i = 0; i < count; i++) {
    const isComplete = Math.random() > 0.5; // 50% chance
    todos.push({
      title: `Random Todo ${i + 1}`,
      status: isComplete ? 'complete' : 'pending',
      owner: new Types.ObjectId(userId),
      completedAt: isComplete
        ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        : null,
    });
  }

  return this.todoModel.insertMany(todos);
}

    
  async topUsersCompletedTodos(days = 7, limit = 3) {
  const now = new Date();
  const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const pipeline: PipelineStage[] = [   
    {
      $match: {
        status: 'complete',
        completedAt: { $gte: from },
      },
    },
    {
      $group: {
        _id: '$owner',
        completedCount: { $sum: 1 },
      },
    },
    { $sort: { completedCount: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: { path: '$user' } },   
    {
      $project: {
        _id: 0,
        userId: '$_id',
        email: '$user.email',
        displayName: '$user.displayName',
        completedCount: 1,
      },
    },
  ];

  return this.todoModel.aggregate(pipeline).exec();
}
}

