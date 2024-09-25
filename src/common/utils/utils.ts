import { type TagType } from '../types/types';

type RT = { [key: string]: TagType };

export const arrToKeyObj = (arr: TagType[]): RT =>
  arr.reduce((acc, cur) => ((acc[cur.id] = cur), acc), {});

export const keyObjToArr = (obj: RT): TagType[] =>
  Object.values(obj).map((v) => v);
