import { ClientEntitySynchronizer } from "@akolos/ts-client-server-game-synchronization";
import { Config } from "game-core/config/config";
import { GameEngine } from "game-core/game-engine";
import { PaddleInputCollector } from "game-core/input/collection/paddle-input-collector";
import { PongEntityFactory } from "networking/entity-synchronization/entity-factory";
import { PongInputCollectionStrategy } from "./pong-input-collection-strategy";
import { PongEntity } from "networking/entities/pong-entity";
import { PongRouterToServer } from "networking/client-server-communication/connections/router-to-server";
import { PongClientEntitySynchronizerContext, PongClientEntitySynchronizer } from "networking/entity-synchronization/client-entity-synchronizer";
import { MessageType } from "networking/client-server-communication/message-type";
import { GameObjectSynchronizer } from "networking/entity-synchronization/game-object-synchronizer";
import { PongGameMessageSyncer } from "networking/game-synchronization/context-message-syncer";

export interface GameClientServerConnectionInfo {
  router: PongRouterToServer;
  clientId: string;
  entityUpdateRateHz: number;
  serverUpdateRateInHz: number;
  gameMessageProcessingRate: number;
}

interface ServerSyncInfo {
  entitySyncer: ClientEntitySynchronizer<PongEntity>;
  gameObjectAndEntitySyncer: GameObjectSynchronizer;
  gameMessageSyncer: PongGameMessageSyncer;
  entityUpdateRateHz: number;
}

export class PongGameClientSideSynchronizer {

  public game: GameEngine;
  private readonly inputCollector: PaddleInputCollector;
  private readonly serverInfo: ServerSyncInfo;

  public constructor(game: GameEngine, inputCollector: PaddleInputCollector, serverInfo: GameClientServerConnectionInfo) {

    this.game = game;
    this.inputCollector = inputCollector;

    this.serverInfo = this.connectToServer(serverInfo);
  }

  public start() {
    this.game.start();

    if (this.serverInfo != null) {
      const { entitySyncer, gameObjectAndEntitySyncer, gameMessageSyncer, entityUpdateRateHz } = this.serverInfo;

      entitySyncer.start(entityUpdateRateHz);
      gameObjectAndEntitySyncer.start();
      gameMessageSyncer.start();
    }
  }

  public stop() {
    this.game.stop();

    if (this.serverInfo != null) {
      const { entitySyncer, gameObjectAndEntitySyncer, gameMessageSyncer } = this.serverInfo;

      entitySyncer.stop();
      gameObjectAndEntitySyncer.stop();
      gameMessageSyncer.stop();
    }
  }

  private connectToServer(connectionInfo: GameClientServerConnectionInfo) {
    const entitySyncer = this.createEntitySyncer(connectionInfo);
    const gameObjectAndEntitySyncer = new GameObjectSynchronizer(this.game, entitySyncer);
    const entityUpdateRateHz = connectionInfo.entityUpdateRateHz;
    const gameMessageBuffer = connectionInfo.router.getFilteredMessageBuffer(MessageType.Game);
    const gameMessageSyncer = new PongGameMessageSyncer(this.game, gameMessageBuffer, connectionInfo.gameMessageProcessingRate);

    const server: ServerSyncInfo = {
      entitySyncer,
      gameObjectAndEntitySyncer,
      entityUpdateRateHz,
      gameMessageSyncer,
    }

    return server;
  }

  private createEntitySyncer(connectionInfo: GameClientServerConnectionInfo): PongClientEntitySynchronizer {
    const entityConnection = connectionInfo.router.getFilteredMessageBuffer(MessageType.Entity);

    const syncerContext: PongClientEntitySynchronizerContext = {
      inputCollector: new PongInputCollectionStrategy(connectionInfo.clientId, this.inputCollector),
      entityFactory: new PongEntityFactory(),
      serverConnection: entityConnection,
      serverUpdateRateInHz: connectionInfo.serverUpdateRateInHz,
    };

    const syncer = new ClientEntitySynchronizer(syncerContext);
    return syncer;
  }

}
