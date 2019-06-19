import { InputCollectionStrategy, InputForEntity } from "@akolos/ts-client-server-game-synchronization";
import { PaddleInputCollector } from "../../core/input/collection/paddle-input-collector";

export interface BrowserInputCollectionStrategyContext {
  playerEntityId: string;
}

export class BrowserInputCollectionStrategy implements InputCollectionStrategy {

  constructor(private playerEntityId: string, private inputCollector: PaddleInputCollector) {}

  public getInputs(dt: number): InputForEntity[] {
    const input: InputForEntity = {
      entityId: this.playerEntityId,
      input: this.inputCollector.getPaddleMoveInput(dt)
    }

    return [input];
  }
}