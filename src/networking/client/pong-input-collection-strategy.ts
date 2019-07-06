import { InputCollectionStrategy, InputForEntity, PickInput } from "@akolos/ts-client-server-game-synchronization";
import { PaddleInputCollector } from "../../game-core/input/collection/paddle-input-collector";
import { PongEntity } from "networking/entities/pong-entity";

export interface PongInputCollectionStrategyContext {
  playerEntityId: string;
}

export class PongInputCollectionStrategy implements InputCollectionStrategy<PongEntity> {

  constructor(private playerEntityId: string, private inputCollector: PaddleInputCollector) {}

  public getInputs(dt: number): Array<InputForEntity<PongEntity>> {
    const input: InputForEntity<PongEntity> = {
      entityId: this.playerEntityId,
      input: this.inputCollector.getPaddleMoveInput(dt) as unknown as PickInput<PongEntity>,
    };

    return [input];
  }
}
