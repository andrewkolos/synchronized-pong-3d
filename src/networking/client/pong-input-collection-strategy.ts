import { InputCollectionStrategy, InputForEntity, PickInput } from "@akolos/ts-client-server-game-synchronization";
import { PaddleInputCollector } from "../../game-core/input/collection/paddle-input-collector";
import { PongEntity } from "networking/entities/pong-entity";
import { PaddleInput, NullPaddleInput } from "game-core/input/paddle-input";
import { PaddleEntity } from "networking/entities/paddle";
import { compareDumbObjects } from 'misc/compareDumbObjects';

export interface PongInputCollectionStrategyContext {
  playerEntityId: string;
}

export class PongInputCollectionStrategy implements InputCollectionStrategy<PongEntity> {

  constructor(private playerEntityId: string, private inputCollector: PaddleInputCollector) { }

  public getInputs(dt: number): Array<InputForEntity<PongEntity>> {

    const inputForPlayerEntity: InputForEntity<PongEntity> = {
      entityId: this.playerEntityId,
      input: this.adaptInput(this.inputCollector.getPaddleMoveInput(dt)),
    };

    return [inputForPlayerEntity];
  }

  private adaptInput(input: PaddleInput): PickInput<PaddleEntity> {
    return {
      dx: input.dx,
      dy: input.dy,
      dzRot: input.dzRotation,
    };
  }
}
