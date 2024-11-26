import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { Room } from './entity/room.entity';
import { In, QueryRunner, Repository } from 'typeorm';
import { TokenUser } from 'src/common/types/types';
import { CreateMessageDto } from './dto/create-message.dto';
import { Role, User } from 'src/user/entity/user.entity';
import { WsException } from '@nestjs/websockets';
import { Message } from './entity/message.entity';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ChatService {
  private readonly connectedClient = new Map<string, Socket>();

  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  registerClient(id: string, client: Socket) {
    this.connectedClient.set(id, client);
  }

  getClientById(id: string) {
    return this.connectedClient.get(id);
  }

  removeClient(id: string) {
    this.connectedClient.delete(id);
  }

  getClients() {
    return this.connectedClient;
  }

  getClientsDetail() {
    return [...this.connectedClient].map(([userId, client]) => ({
      socketId: client.id,
      id: client.data.user.id,
      nickname: client.data.user.nickname,
      role: client.data.user.role,
    }));
  }

  getClientLength() {
    return this.connectedClient.size;
  }

  async joinRoom(client: Socket) {
    if (!client || !client.data || !client.data.user)
      throw new WsException('유저 정보가 없습니다.');
    const rooms = await this.roomRepository
      .createQueryBuilder('room')
      .innerJoin('room.users', 'user', 'user.id =:userId', {
        userId: client.data.user.id,
      })
      .getMany();

    // console.log(rooms);

    rooms.forEach((room) => {
      client.join(room.id);
      const u = client.data.user;
      client.to(room.id).emit('join-r', u);
    });
  }

  async getRooms(user: TokenUser) {
    let messages;

    if (user.role === Role.admin) {
      return await this.roomRepository.find({
        relations: ['users'],
        select: {
          id: true,
          users: {
            id: true,
            nickname: true,
            role: true,
          },
        },
      });
    }
    // const rooms = await this.roomRepository.find({
    //   where: {
    //     users: {
    //       id: user.id,
    //     },
    //   },
    //   relations: ['users'],
    //   select: {
    //     users: {
    //       id: true,
    //       nickname: true,
    //       role: true,
    //     },
    //   },
    // });
    const rooms = await this.roomRepository
      .createQueryBuilder('room')
      .innerJoin('room.users', 'user')
      .where('user.id = :userId', { userId: user.id })
      .select(['room', 'user.id', 'user.nickname', 'user.role'])
      .getMany();

    if (!rooms.length) return null;
    if (rooms.length) {
      messages = await this.messageRepository.find({
        where: { room: { id: rooms[0].id } },
        relations: ['owner'],
        select: {
          id: true,
          createdAt: true,
          message: true,
          owner: {
            id: true,
            nickname: true,
            role: true,
          },
        },
      });
    }

    return [{ ...rooms[0], messages }];
  }

  async getMessages(client: Socket, roomId: string) {
    const messages = await this.messageRepository.find({
      where: {
        room: {
          id: roomId,
        },
      },
      relations: ['owner'],
      select: {
        owner: {
          id: true,
          role: true,
          nickname: true,
        },
      },
      order: {
        createdAt: 'ASC',
      },
    });
    // console.log(messages, 'messages !!!');
    return messages;
  }

  async initRoom(data: { user: TokenUser; rooms: Room[] }, client: Socket) {
    const { user, rooms } = data;
    const { role, id } = user;
    let result =
      role === Role.admin
        ? rooms
        : rooms.filter((room) => !!room.users.find((u) => u.id === id));

    client.emit('init-room-complete', JSON.stringify(result));
    return rooms;
  }

  async createMessage(
    // socketId: string,
    body: CreateMessageDto,
    userInfo: TokenUser,
    qr: QueryRunner,
  ) {
    const user = await qr.manager.findOne(User, { where: { id: userInfo.id } });

    const { roomId } = body;

    const room = await this.getOrCreateRoom(user, qr, roomId);

    const msg = qr.manager.create(Message, {
      message: body.message,
      owner: user,
      room,
    });

    // const message = await qr.manager.save(Message, msg);

    const m = await qr.manager.save(Message, msg);
    const message = await qr.manager.findOne(Message, {
      where: { id: m.id },
      relations: ['owner', 'room'],
      select: {
        id: true,
        createdAt: true,
        message: true,
        owner: {
          id: true,
          role: true,
          nickname: true,
        },
        room: { id: true },
      },
    });

    // const client = this.connectedClient.get(user.id);

    // client.to(room.id).emit('new-message', plainToClass(Room, message));
    // console.log(room.id, 'roomID!');
    // client.emit('new-message', message);
    // client.to(room.id).emit('new-message', message);

    return [room.id, message];
  }

  async getOrCreateRoom(user: User, qr: QueryRunner, roomId: string | null) {
    if (user.role === Role.admin) {
      if (!roomId) throw new WsException('관리자는 roomId가 필요합니다.');
      return await qr.manager.findOne(Room, {
        where: {
          id: roomId,
        },
        relations: ['users'],
      });
    }

    let room = await qr.manager
      .createQueryBuilder(Room, 'room')
      .innerJoin('room.users', 'user')
      .where('user.id = :userId', { userId: user.id })
      .getOne();

    if (!room) {
      const admin = await qr.manager.findOne(User, {
        where: { role: Role.admin },
      });
      const u = await qr.manager.findOne(User, { where: { id: user.id } });

      const r = await qr.manager.create(Room, { users: [admin, u] });
      room = await qr.manager.save(Room, r);

      [admin, user].forEach(({ id, nickname }) => {
        const client = this.connectedClient.get(id);
        if (client) {
          client.emit('join-room', { id: room.id, user: { id, nickname } });
          client.join(room.id);
        }
      });
    }

    return room;
  }
}
