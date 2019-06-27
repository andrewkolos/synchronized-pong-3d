import { SyncableEntity } from "@akolos/ts-client-server-game-synchronization";

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

  public constructor(id: string, initialState: PaddleState) {
    super(id, initialState);
  }

  public calcNextStateFromInput(currentState: PaddleState, input: PaddleInput) {
    return {
      x: currentState.x + input.dx,
      y: currentState.y + input.dy,
      zRot: currentState.zRot + input.dzRot,
    };
  }
  public interpolate(state1: PaddleState, state2: PaddleState, timeRatio: number) {
    return {
      x: (state2.x - state1.x) * timeRatio,
      y: (state2.y - state1.y) * timeRatio,
      zRot: (state2.zRot - state2.zRot) * timeRatio,
    };
  }
}
