import { Exclude } from 'class-transformer';
import { OmitIdBaseModel } from 'src/common/entities/base.entity';
import {
  BeforeInsert,
  Column,
  Entity,
  Generated,
  ManyToMany,
  OneToMany,
  PrimaryColumn,
  ValueTransformer,
} from 'typeorm';
import { CustomUUIDGenerator, UUIDTransformer } from 'src/common/utils/utils';
import { Message } from 'src/chat/entity/message.entity';
import { Room } from 'src/chat/entity/room.entity';
import { IsOptional } from 'class-validator';

export enum Role {
  admin,
  user,
}

@Entity()
export class User extends OmitIdBaseModel {
  @PrimaryColumn('varchar', {
    length: 40,
    transformer: UUIDTransformer,
  })
  id: string;

  @BeforeInsert()
  generateId() {
    this.id = CustomUUIDGenerator.generate('U');
  }

  @Column({
    type: 'enum',
    default: Role.user,
    enum: Role,
  })
  role: Role;

  @Column({
    type: 'varchar',
    unique: true,
    length: 40,
  })
  nickname: string;

  @Column('varchar', {
    length: 50,
  })
  @Exclude({
    toPlainOnly: true,
  })
  password: string;

  @OneToMany(() => Message, (message) => message.owner)
  messages: Message[];

  @ManyToMany(() => Room, (room) => room.users)
  rooms: Room[];

  @IsOptional()
  @Column('varchar', {
    nullable: true,
  })
  email?: string;
}
