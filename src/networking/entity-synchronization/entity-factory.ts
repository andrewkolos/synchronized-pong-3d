import { EntityFactory, SyncableEntity } from "@akolos/ts-client-server-game-synchronization";
import { BallEntity } from "../entities/ball";
import { PaddleEntity } from "../entities/paddle";
import { EntityId } from "./entity-ids";
import { PongEntity } from 'networking/entities/pong-entity';

export class PongEntityFactory implements EntityFactory<PongEntity> {
  public fromStateMessage(entityId: string, state: any): PongEntity {
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
