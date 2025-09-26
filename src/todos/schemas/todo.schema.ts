import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TodoDocument = Todo & Document;

@Schema({ timestamps: true })
export class Todo {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ required: true, enum: ['pending', 'complete'], default: 'pending' })
  status: 'pending' | 'complete';

  @Prop()
  dueDate?: Date;

  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  owner: Types.ObjectId;


    @Prop({ type: Date, default: null })
    completedAt?: Date | null;   

}

export const TodoSchema = SchemaFactory.createForClass(Todo);

// middleware: set completedAt when status becomes complete
TodoSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'complete' && !this.completedAt) {
    this.completedAt = new Date();
  }
  if (this.isModified('status') && this.status === 'pending') {
    this.completedAt = undefined;
  }
  next();
});
