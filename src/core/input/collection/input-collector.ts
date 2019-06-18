import { PaddleInput } from "../paddle-input";

export interface InputCollector {
  getPaddleMoveInput(dt: number): PaddleInput;
}
