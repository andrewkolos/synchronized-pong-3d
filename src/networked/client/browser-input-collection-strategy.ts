import { InputCollectionStrategy, InputForEntity } from '@akolos/ts-client-server-game-synchronization';
import { Pong3dInputCollector } from '../../core/input/collection/input-collector';

export interface Pong3DBrowserInputCollectionStrategyContext {
  playerEntityId: string;
}

export class Pong3DBrowserInputCollectionStrategy implements InputCollectionStrategy {

  constructor(private playerEntityId: string, private inputCollector: Pong3dInputCollector) {}

  public getInputs(dt: number): InputForEntity[] {
    const input: InputForEntity = {
      entityId: this.playerEntityId,
      input: this.inputCollector.getPaddleMoveInput(dt)
    }

    return [input];
  }
}