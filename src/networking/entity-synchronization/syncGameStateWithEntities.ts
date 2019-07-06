import { EntityId } from "networking/entity-synchronization/entity-ids";
import { GameEngine } from "../../game-core/game-engine";
import { Paddle } from "../../game-core/paddle";
import { BallEntity } from "../entities/ball";
import { PaddleEntity } from "../entities/paddle";
import { PongEntity } from "../entities/pong-entity";

export function syncGameStateWithEntities(gameToSync: GameEngine, entities: PongEntity[]) {
    entities.forEach((value: PongEntity) => {
      switch (value.id) {
        case EntityId.P1:
          const player1 = value as PaddleEntity;
          applySyncPaddleStateToGame(player1, gameToSync.player1Paddle);
          break;
        case EntityId.P2:
          const player2 = value as PaddleEntity;
          applySyncPaddleStateToGame(player2, gameToSync.player2Paddle);
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

function applySyncPaddleStateToGame(syncPaddle: PaddleEntity, gamePaddle: Paddle): void {
    gamePaddle.position.x = syncPaddle.state.x;
    gamePaddle.position.y = syncPaddle.state.y;
    gamePaddle.zRotationEulers = syncPaddle.state.zRot;
}
