import { Message } from 'ai';
import { IsString } from 'class-validator';

export class AskCloneDto {
  @IsString()
  messages : Message[];
}
