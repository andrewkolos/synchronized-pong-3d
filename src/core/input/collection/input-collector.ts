import { PaddleInput } from '../paddle-input';

export interface Pong3dInputCollector {
  getPaddleMoveInput(dt: number): PaddleInput;
}