import { InputCollectionStrategy, InputForEntity } from "@akolos/ts-client-server-game-synchronization";
import { PaddleInputCollector } from "../../game-core/input/collection/paddle-input-collector";

export interface POngInputCollectionStrategyContext {
  playerEntityId: string;
}

export class PongInputCollectionStrategy implements InputCollectionStrategy {

  constructor(private playerEntityId: string, private inputCollector: PaddleInputCollector) {}

  public getInputs(dt: number): InputForEntity[] {
    const input: InputForEntity = {
      entityId: this.playerEntityId,
      input: this.inputCollector.getPaddleMoveInput(dt);
    }

    return [input];
  }
}