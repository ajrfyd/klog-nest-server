import { type TagType } from '../types/types';

type RT = { [key: string]: TagType };

export const arrToKeyObj = (arr: TagType[]): RT =>
  arr.reduce((acc, cur) => ((acc[cur.id] = cur), acc), {});

export const keyObjToArr = (obj: RT): TagType[] =>
  Object.values(obj).map((v) => v);

export const getRemainingTime = (now: Date) => {
  const t = now.getHours();
  const m = now.getMinutes();

  // return (24 - t - 1) * (60 - m) * 60 * 1000;
  return ((24 - t - 1) * 60 * 60 + (60 - m) * 60) * 1000;
};
