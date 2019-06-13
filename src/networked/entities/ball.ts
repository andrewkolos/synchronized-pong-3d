import { SyncableEntity } from "@akolos/ts-client-server-game-synchronization";

export interface BallInput {
  x: number;
  y: number;
  dx: number;
  dy: number;
}

export interface BallState {
  x: number;
  y: number;
  dx: number;
  dy: number;
}

export class BallEntity extends SyncableEntity<BallInput, BallState> {
  // tslint:disable-next-line: variable-name
  public calcNextStateFromInput(_currentState: BallState, input: BallInput) {
    return input;
  }
  public interpolate(state1: BallState, state2: BallState, timeRatio: number) {
    return {
      x: (state1.x - state2.x) * timeRatio,
      y: (state1.y - state2.y) * timeRatio,
      dx: (state1.dx - state2.dx) * timeRatio,
      dy: (state1.dy - state1.dy) * timeRatio,
    };
  }
}
