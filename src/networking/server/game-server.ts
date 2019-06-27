import { SyncableEntity } from "@akolos/ts-client-server-game-synchronization";
import { Config } from "game-core/config/config";
import { GameEngine } from "game-core/game-engine";
import { BallEntity } from "../entities/ball";
import { PaddleEntity } from "../entities/paddle";
import { PongEntity } from "../entities/pong-entity";
import { PongServerEntitySynchronizer } from "../entity-synchronization/server-entity-synchronizer";
import { MessageType, PongRouterToClient } from "../game-network-connection";
import { syncGameStateWithEntities } from "../entity-synchronization/syncGameStateWithEntities";
import { arePongEntities } from "networking/entity-synchronization/arePongEntities";

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

  public stop() {
    this.game.stop();

  }

  public connectClient(router: PongRouterToClient) {
    const entitySyncConnection = router.getConnection(MessageType.Entity, MessageType.Entity);
    this.entitySyncer.connect(entitySyncConnection);
  }

  private syncGameAndSyncer() {
    const entities = this.entitySyncer.entities.getEntities();
    if (arePongEntities(entities)) {
      syncGameStateWithEntities(this.game, entities);
    } else {
      throw Error ("Unknown entity was given by the entity synchronizer.");
    }
  }

  private init() {
    this.entitySyncer.eventEmitter.on("synchronized", () => this.syncGameAndSyncer());
  }
}
