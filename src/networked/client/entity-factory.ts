import { EntityFactory, SyncableEntity } from "@akolos/ts-client-server-game-synchronization";
import { PaddleEntity } from "../entities/paddle";

export class EntityFactory implements EntityFactory {
  public fromStateMessage(entityId: string, state: any): SyncableEntity<any, any> {
    return new PaddleEntity(entityId, state);
  }
}
