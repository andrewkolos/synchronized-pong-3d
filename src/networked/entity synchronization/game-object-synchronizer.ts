import { ClientEntitySynchronizer, ServerEntitySynchronizer,
        SyncableEntity } from "@akolos/ts-client-server-game-synchronization";
import { GameEngine } from "../../core/game-engine";
import { Paddle } from "../../core/paddle";
import { BallEntity } from "../entities/ball";
import { PaddleEntity } from "../entities/paddle";
import { EntityId } from "./entity-ids";

type EntitySynchronizer = ClientEntitySynchronizer | ServerEntitySynchronizer;

export class GameObjectSynchronizer {

  private onSyncCallback?: () => void;

  public constructor(private gameToSync: GameEngine, private entitySyncer: EntitySynchronizer) {}

  public start() {
    this.onSyncCallback = () => this.sync();
    this.entitySyncer.eventEmitter.on("synchronized", this.onSyncCallback);
  }

  public stop() {
    if (this.onSyncCallback != null) {
      this.entitySyncer.eventEmitter.off("synchronized", this.onSyncCallback);
      this.onSyncCallback = undefined;
    }
  }

  private sync() {
    const gameToSync = this.gameToSync;

    this.entitySyncer.entities.getEntities().forEach((value: SyncableEntity<unknown, unknown>) => {
      switch (value.id) {
        case EntityId.P1:
          const player1 = value as PaddleEntity;
          this.applySyncPaddleStateToGame(player1, gameToSync.player1Paddle);
          break;
        case EntityId.P2:
          const player2 = value as PaddleEntity;
          this.applySyncPaddleStateToGame(player2, gameToSync.player2Paddle);
          break;
        case EntityId.Ball:
          const ball = value as BallEntity;
          gameToSync.ball.position.x = ball.state.x;
          gameToSync.ball.position.y = ball.state.y;
          gameToSync.ball.velocity.x = ball.state.dx;
          gameToSync.ball.velocity.y = ball.state.dy;
          break;
      }
    });
  }

  private applySyncPaddleStateToGame(syncPaddle: PaddleEntity, gamePaddle: Paddle): void {
    gamePaddle.position.x = syncPaddle.state.x;
    gamePaddle.position.y = syncPaddle.state.y;
    gamePaddle.zRotationEulers = syncPaddle.state.zRot;
  }
}
