import { SyncableEntity } from "@akolos/ts-client-server-game-synchronization";
import { interpolateStatesLinearly } from 'misc/interpolateStatesLinearly';

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
    const nextState =  interpolateStatesLinearly(state1, state2, timeRatio);
    nextState.dx = state2.dx;
    nextState.dy = state2.dy;
    return nextState;
  }
}
