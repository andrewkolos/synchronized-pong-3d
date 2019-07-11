import { SyncableEntity } from "@akolos/ts-client-server-game-synchronization";

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
    return {
      x: interpolateLinearly(state2.x, state1.x, timeRatio),
      y: interpolateLinearly(state2.y, state1.y, timeRatio),
      velX: interpolateLinearly(state2.velX, state1.velX, timeRatio),
      velY: interpolateLinearly(state2.velY, state1.velY, timeRatio),
      zRot: interpolateLinearly(state2.zRot, state1.zRot, timeRatio),
    };
  }
}

function interpolateLinearly(value1: number, value2: number, timeRatio: number) {
  return value1 + ((value2 - value1) * timeRatio);
}