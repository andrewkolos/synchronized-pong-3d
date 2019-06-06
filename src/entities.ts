import { SyncableEntity } from '@akolos/ts-client-server-game-synchronization';

export interface PaddleInput {
  dx: number;
  dy: number;
  dzRot: number;
}

export interface PaddleState {
  x: number;
  y: number;
  zRot: number;
}

export class PaddleEntity extends SyncableEntity<PaddleInput, PaddleState> {
  public calcNextStateFromInput(currentState: PaddleState, input: PaddleInput) {
    return {
      x: currentState.x + input.dx,
      y: currentState.y + input.dy,
      zRot: currentState.zRot + input.dzRot
    }
  }

  public interpolate(state1: PaddleState, state2: PaddleState, timeRatio: number) {
    return {
      x: (state2.x - state1.x) * timeRatio,
      y: (state2.y - state1.y) * timeRatio,
      zRot: (state2.zRot - state2.zRot) * timeRatio
    }
  }
}

export interface BallInput {
  x: number;
  y: number;
}

export interface BallState {
  x: number;
  y: number;
}

export class BallEntity extends SyncableEntity<BallInput, BallState> {
  public calcNextStateFromInput(_currentState: BallState, input: BallInput) {
    return input;
  }

  public interpolate(state1: BallState, state2: BallState, timeRatio: number) {
    return {
      x: (state1.x - state2.x) * timeRatio,
      y: (state1.y - state2.y) * timeRatio
    }
  }
}