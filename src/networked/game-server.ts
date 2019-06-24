import { InputMessage, StateMessage, SyncableEntity } from "@akolos/ts-client-server-game-synchronization";
import { Config } from "core/config/config";
import { Player } from "core/enum/player";
import { GameEngine, Score } from "core/game-engine";
import { PongServerEntitySynchronizer } from "./entity synchronization/server-entity-synchronizer";
import { PongRouterToClient } from './game-network-connection';

interface ReceiveFromClientTypeMap  {
  entity: InputMessage;
}

interface SendToClientTypeMap {
  entity: StateMessage;
  score: Score;
  server: Player;
  timeUntilServeSec: number;
}

export class PongGameServer {

  private game: GameEngine;
  private entitySyncer: PongServerEntitySynchronizer;
  private syncRateHz: number;

  public constructor(gameConfig: Config, syncRateHz: number) {
    this.game = new GameEngine(gameConfig);
    this.entitySyncer = new PongServerEntitySynchronizer(gameConfig.paddles.baseMoveSpeedPerMs);
    this.syncRateHz = syncRateHz;

    this.init();
  }

  public start() {
    this.game.start();

    this.entitySyncer.startServer(this.syncRateHz);
  }

  public connectClient(connection: PongRouterToClient) {
  }

  private syncGameAndSyncer() {
    this.entitySyncer.entities.getEntities().forEach((entity: SyncableEntity<any, any>) => {
      if (!entityIsPongEntity(entity)) {
        throw Error("Encountered entity that's not a pong entity.");
      } else {
        entity.applyToPongGame(this.game);
      }
    });
  }

  private init() {
    this.entitySyncer.eventEmitter.on("synchronized", () => this.syncGameAndSyncer());

    this.game.eventEmitter.;
  }
}