import { ClientEntitySynchronizer, ClientEntitySynchronizerContext, InputCollectionStrategy, SyncableEntity } from '@akolos/ts-client-server-game-synchronization';
import { Pong3dGameEngine, Paddle } from '../core/game-engine';
import { Pong3dLocalServerConnection } from './local/local-server-connection';
import { Pong3dEntityFactory } from './client/entity-factory';
import { Pong3DBrowserInputCollectionStrategy } from './client/browser-input-collector';
import { PaddleEntity, BallEntity } from './entities';

export interface Pong3dNetworkAdapterContext {
  serverConnection: Pong3dLocalServerConnection;
  serverUpdateRate: number;
  inputCollectionStrategy: InputCollectionStrategy;
}


export class Pong3dNetworkAdapter {

  public constructor(gameToSync: Pong3dGameEngine, context: Pong3dNetworkAdapterContext) {
    const entityFactory = new Pong3dEntityFactory();

    const syncContext: ClientEntitySynchronizerContext = {
      entityFactory,
      inputCollector: context.inputCollectionStrategy,
      serverConnection: context.serverConnection,
      serverUpdateRateInHz: context.serverUpdateRate
    }

    const synchronizer = new ClientEntitySynchronizer(syncContext);
    synchronizer.eventEmitter.on('synchronized', () => {
      synchronizer.entities.getEntities().forEach((value: SyncableEntity<any, any>) => {
        switch (value.id) {
          case 'player1':
            const player1 = value as PaddleEntity;
            this.applySyncPaddleStateToGame(player1, gameToSync.player1Paddle);
            break;
          case 'player2':
            const player2 = value as PaddleEntity;
            this.applySyncPaddleStateToGame(player2, gameToSync.player2Paddle);
            break;
          case 'ball':
            const ball = value as BallEntity;
            gameToSync.ball.object.position.x = ball.state.x;
            gameToSync.ball.object.position.y = ball.state.y;
            gameToSync.ball.dx = ball.state.dx;
            gameToSync.ball.dy = ball.state.dy;
            break;
        }
      })
    });
  }

  private applySyncPaddleStateToGame(syncPaddle: PaddleEntity, gamePaddle: Paddle): void {
    gamePaddle.object.position.x = syncPaddle.state.x;
    gamePaddle.object.position.y = syncPaddle.state.y;
    gamePaddle.object.rotation.z = syncPaddle.state.zRot;
  }
}