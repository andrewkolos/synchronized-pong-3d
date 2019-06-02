import { SyncableEntity } from '@akolos/ts-client-server-game-synchronization';

interface PaddleInput {
  x: number;
  y: number;
  z: number;
}

interface PaddleState {
  x: number;
  y: number;
  z: number;
}

export class PaddleEntity extends SyncableEntity<PaddleInput, PaddleState> {
  public calcNextStateFromInput(_currentState: PaddleState, input: PaddleInput) {
    return input;
  }

  public interpolate(state1: PaddleState, state2: PaddleState, timeRatio: number) {
    return {
      x: (state2.x - state1.x) * timeRatio,
      y: (state2.y - state1.y) * timeRatio,
      z: (state2.z - state2.z) * timeRatio
    }
  }
}

interface BallInput {
  x: number;
  y: number;
}

interface BallState {
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