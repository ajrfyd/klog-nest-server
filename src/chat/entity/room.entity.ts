import { OmitIdBaseModel } from 'src/common/entities/base.entity';
import { CustomUUIDGenerator, UUIDTransformer } from 'src/common/utils/utils';
import {
  BeforeInsert,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Message } from './message.entity';
import { User } from 'src/user/entity/user.entity';

@Entity()
export class Room extends OmitIdBaseModel {
  @PrimaryColumn('varchar', {
    length: 40,
    transformer: UUIDTransformer,
  })
  id: string;

  @BeforeInsert()
  generateId() {
    this.id = CustomUUIDGenerator.generate('R');
  }

  @OneToMany(() => Message, (msg) => msg.room)
  messages: Message[];

  @ManyToMany(() => User, (user) => user.rooms)
  @JoinTable()
  users: User[];
}
