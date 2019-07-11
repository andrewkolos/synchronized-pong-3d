import { SyncableEntity } from "@akolos/ts-client-server-game-synchronization";
import { interpolateStatesLinearly } from 'misc/interpolateStatesLinearly';

export interface PaddleEntityInput {
  dx: number;
  dy: number;
  dzRot: number;
}

export interface PaddleEntityState {
  x: number;
  y: number;
  velX: number;
  velY: number;
  zRot: number;
}

export class PaddleEntity extends SyncableEntity<PaddleEntityInput, PaddleEntityState> {

  public constructor(id: string, initialState: PaddleEntityState) {
    super(id, initialState);
  }

  public calcNextStateFromInput(currentState: PaddleEntityState, input: PaddleEntityInput): PaddleEntityState {
    return {
      x: currentState.x + input.dx,
      y: currentState.y + input.dy,
      velX: input.dx,
      velY: input.dy,
      zRot: currentState.zRot + input.dzRot,
    };
  }
  public interpolate(state1: PaddleEntityState, state2: PaddleEntityState, timeRatio: number) {
    return interpolateStatesLinearly(state1, state2, timeRatio);
  }
}