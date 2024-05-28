import { Vector } from 'ts-matrix';
import { IPointer } from './useGesture';

export const calculateDelata = (
  event: PointerEvent,
  index: number,
  curTouches: IPointer[]
): Vector => {
  const prevPoint = curTouches[index];
  return direction(prevPoint.position, new Vector([event.pageX, event.pageY]));
};

export const distance = (p1: Vector, p2: Vector): number => {
  return Math.sqrt(Math.pow(p2.at(0) - p1.at(0), 2) + Math.pow(p2.at(1) - p1.at(1), 2));
};

export const normalize = (v: Vector): Vector => {
  if (v.at(0) === 0 && v.at(1) === 0) {
    return new Vector([0, 0]);
  }

  return v.normalize();
};

export const direction = (p1: Vector, p2: Vector): Vector => {
  return p2.subtract(p1);
};

export const get360angleVector2D = (v1: Vector, v2: Vector): number => {
  const v13D = new Vector([v1.at(0), v1.at(1), 0]);
  const v23D = new Vector([v2.at(0), v2.at(1), 0]);
  return Vector.get360angle(v13D, v23D);
};

export const twoFingerDirection = (curTouches: IPointer[]) => {
  return curTouches[0].delta.add(curTouches[1].delta);
};

export const twoFingerDotProduct = (curTouches: IPointer[]) => {
  const vec0Normalized = normalize(curTouches[0].delta);
  const vec1Normalized = normalize(curTouches[1].delta);

  const dotProduct = vec0Normalized.dot(vec1Normalized);

  return Math.max(0, dotProduct);
};
