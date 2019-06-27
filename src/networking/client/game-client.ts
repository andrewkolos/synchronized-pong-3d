import { ClientEntitySynchronizer,
         ClientEntitySynchronizerContext } from "@akolos/ts-client-server-game-synchronization";
import { Config } from "game-core/config/config";
import { GameEngine } from "game-core/game-engine";
import { PaddleInputCollector } from "game-core/input/collection/paddle-input-collector";
import { ClientId } from "networking/client-id";
import { PongEntityFactory } from "networking/entity-synchronization/entity-factory";
import { MessageType, PongRouterToServer } from "networking/game-network-connection";
import { PongInputCollectionStrategy } from "./pong-input-collection-strategy";

export interface GameClientServerConnectionInfo {
  router: PongRouterToServer;
  clientId: string;
  serverUpdateRateInHz: number;
}

export class GameClient {

  public game: GameEngine;
  public entitySyncer: ClientEntitySynchronizer;
  private inputCollector: PaddleInputCollector;

  public constructor(gameConfig: Config, inputCollector: PaddleInputCollector,
                     connectionInfo: GameClientServerConnectionInfo) {
    this.game = new GameEngine(gameConfig);
    this.inputCollector = inputCollector;
    this.entitySyncer = this.connectToServer(connectionInfo);
  }

  public start() {
    this.entitySyncer
  }

  private connectToServer(connectionInfo: GameClientServerConnectionInfo): ClientEntitySynchronizer {
    const entityConnection = connectionInfo.router.getConnection(MessageType.Entity, MessageType.Entity);

    const syncerContext: ClientEntitySynchronizerContext = {
      inputCollector: new PongInputCollectionStrategy(connectionInfo.clientId, this.inputCollector),
      entityFactory: new PongEntityFactory(),
      serverConnection: entityConnection,
      serverUpdateRateInHz: connectionInfo.serverUpdateRateInHz,
    };

    const syncer = new ClientEntitySynchronizer(syncerContext);
    return syncer;
  }

}
