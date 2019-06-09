import { PaddleEntity } from '../entities';
import { SyncableEntity, EntityFactory } from '@akolos/ts-client-server-game-synchronization';

export class Pong3dEntityFactory implements EntityFactory {
  fromStateMessage(entityId: string, state: any): SyncableEntity<any, any> {
    return new PaddleEntity(entityId, state);
  }
}