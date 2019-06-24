import { EntityFactory, SyncableEntity } from "@akolos/ts-client-server-game-synchronization";
import { BallEntity } from "../entities/ball";
import { PaddleEntity } from "../entities/paddle";
import { EntityId } from "./entity-ids";

export class PongEntityFactory implements EntityFactory {
  public fromStateMessage(entityId: string, state: any): SyncableEntity<any, any> {
    switch (entityId) {
      case EntityId.P1:
      case EntityId.P2:
        return new PaddleEntity(entityId, state);
      case EntityId.Ball:
        return new BallEntity(entityId, state);
      default:
        throw Error(`Received unexpected entity ID: ${entityId}.`);
    }
  }
}
