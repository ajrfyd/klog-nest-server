import { OmitIdBaseModel } from 'src/common/entities/base.entity';
import { CustomUUIDGenerator, UUIDTransformer } from 'src/common/utils/utils';
import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Room } from './room.entity';
import { MinLength } from 'class-validator';
import { User } from 'src/user/entity/user.entity';

@Entity()
export class Message extends OmitIdBaseModel {
  @PrimaryColumn('varchar', {
    length: 40,
    transformer: UUIDTransformer,
  })
  id: string;

  @BeforeInsert()
  generateId() {
    this.id = CustomUUIDGenerator.generate('M');
  }

  @Column({ type: 'text' })
  @MinLength(1)
  message: string;

  @ManyToOne(() => User, (user) => user.messages)
  @JoinColumn()
  owner: User;

  @ManyToOne(() => Room, (room) => room.messages)
  @JoinColumn()
  room: Room;
}
