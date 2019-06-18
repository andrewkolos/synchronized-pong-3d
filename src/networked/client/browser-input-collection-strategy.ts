import { InputCollectionStrategy, InputForEntity } from "@akolos/ts-client-server-game-synchronization";
import { InputCollector } from "../../core/input/collection/input-collector";

export interface BrowserInputCollectionStrategyContext {
  playerEntityId: string;
}

export class BrowserInputCollectionStrategy implements InputCollectionStrategy {

  constructor(private playerEntityId: string, private inputCollector: InputCollector) {}

  public getInputs(dt: number): InputForEntity[] {
    const input: InputForEntity = {
      entityId: this.playerEntityId,
      input: this.inputCollector.getPaddleMoveInput(dt)
    }

    return [input];
  }
}