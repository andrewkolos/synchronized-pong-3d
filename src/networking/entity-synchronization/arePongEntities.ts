import { SyncableEntity } from "@akolos/ts-client-server-game-synchronization";
import { BallEntity } from "networking/entities/ball";
import { PaddleEntity } from "networking/entities/paddle";
import { PongEntity } from "networking/entities/pong-entity";

export function arePongEntities(entities: Array<SyncableEntity<unknown, unknown>>): entities is PongEntity[] {
  return entities.every((entity) => {
    return entity instanceof PaddleEntity || entity instanceof BallEntity;
  });
}