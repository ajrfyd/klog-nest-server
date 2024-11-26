import { v4 } from 'uuid';
import { type TagType } from '../types/types';
import { ValueTransformer } from 'typeorm';

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

export class CustomUUIDGenerator {
  static generate(prefix: string): string {
    return `${prefix}-${v4()}`;
  }
}

export const UUIDTransformer: ValueTransformer = {
  to: (value: string) => value,
  from: (value: string) => value,
};

export const getCookieValue = (cookie: string, key: string) => {
  if (typeof cookie !== 'string' || !cookie.length) return false;

  const cookieArr = cookie.split(' ');

  //! 쿠키의 패턴과 다른 문자
  if (cookieArr.length === 1 && !cookieArr[0].includes('=')) return false;

  const cookies = cookieArr.reduce((acc, cur) => {
    const [k, v] = cur.split('=');
    acc[k] = v[v.length - 1] === ';' ? v.slice(0, -1) : v;
    return acc;
  }, {});

  return cookies[key];
};
