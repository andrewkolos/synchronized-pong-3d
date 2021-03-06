import { Config } from "game-core/config/config";
import { GameEngine } from "game-core/game-engine";
import { PongServerEntitySynchronizer } from "../entity-synchronization/server-entity-synchronizer";
import { PongRouterToClient } from "networking/client-server-communication/connections/router-to-client";
import { MessageType } from "networking/client-server-communication/message-type";
import { MessageBuffer } from "@akolos/ts-client-server-game-synchronization";
import { ServerGameMessage } from "networking/client-server-communication/messages/sent-from-server/server-game-message";
import { PaddleServingMessage } from "networking/client-server-communication/messages/sent-from-server/paddle-serving-message";
import { ServerGameMessageKind } from "networking/client-server-communication/messages/sent-from-server/server-game-message-kind";
import { ScoreMessage } from "networking/client-server-communication/messages/sent-from-server/score-message";
import { IntervalRunner } from "misc/interval-runner";
import { ClientId } from "networking/client-id";
import { Player } from "game-core/enum/player";
import { getPaddleByPlayer } from "game-core/common";
import { PaddleEntityState } from "networking/entities/paddle";
import { BallState } from "networking/entities/ball";
import { GameObjectSynchronizer } from 'networking/entity-synchronization/game-object-synchronizer';

export interface PongGameServerConfig {
  gameConfig: Config;
  entityBroadcastRateHz: number;
  gameBroadcastRateHz: number;
}

/**
 * Runs an instance of the pong game and broadcasts the position of entities and the state of the game
 * (i.e. score, server).
 */
export class PongGameServer {

  public readonly game: GameEngine;

  private readonly entitySyncer: PongServerEntitySynchronizer;

  private entityBroadcastRateHz: number;
  private readonly gameStateBroadcaster: IntervalRunner;
  private readonly gameBroadcastBuffers: Array<MessageBuffer<never, ServerGameMessage>> = [];

  private readonly gameObjectSyncer: GameObjectSynchronizer;

  public constructor(config: PongGameServerConfig) {

    const { gameConfig, entityBroadcastRateHz: entitySyncRateHz, gameBroadcastRateHz: gameSyncRateHz } = config;

    this.game = new GameEngine(gameConfig);
    this.entitySyncer = new PongServerEntitySynchronizer(gameConfig.paddles.baseMoveSpeedPerMs, {
      player1Y: this.game.player1Paddle.position.y, player2Y: this.game.player2Paddle.position.y});
    this.entityBroadcastRateHz = entitySyncRateHz;
    this.gameStateBroadcaster = new IntervalRunner(() => this.broadcastGameState(), gameSyncRateHz);

    this.entitySyncer.eventEmitter.on("beforeSynchronization", () => this.syncGameAndEntitySyncer());

    this.gameObjectSyncer = new GameObjectSynchronizer(this.game, "Observer", this.entitySyncer);
  }

  /**
   * Start the server, starting the internal game and the state synchronizers.
   */
  public start() {
    this.game.start();
    this.gameStateBroadcaster.start();
    this.entitySyncer.start(this.entityBroadcastRateHz);
    this.gameObjectSyncer.start();
  }

  public stop() {
    this.game.stop();
    this.gameStateBroadcaster.stop();
    this.entitySyncer.stop();
    this.gameObjectSyncer.stop();
  }

  public connectClient(router: PongRouterToClient): ClientId {
    const entitySyncBuffer = router.getFilteredMessageBuffer(MessageType.Entity);
    const gameSyncBuffer = router.getFilteredMessageBuffer(MessageType.Game);

    this.gameBroadcastBuffers.push(gameSyncBuffer);
    return this.entitySyncer.connect(entitySyncBuffer);
  }

  private broadcastGameState() {
    const messages = this.getGameBroadcastMessages();

    this.gameBroadcastBuffers.forEach((buffer: MessageBuffer<never, ServerGameMessage>) => {
      messages.forEach((message: ServerGameMessage) => buffer.send(message));
    });
  }

  private getGameBroadcastMessages(): ServerGameMessage[] {
    const messagesToSend: ServerGameMessage[] = [];

    if (this.game.isBallBeingHeldByServer()) {
      const message: PaddleServingMessage = {
        kind: ServerGameMessageKind.ServingPlayerInfo,
        servingPlayer: this.game.server,
        timeUntilServeSec: this.game.timeUntilServeSec,
      };
      messagesToSend.push(message);
    }

    const scoreMessage: ScoreMessage = {
      kind: ServerGameMessageKind.Score,
      score: this.game.score,
    };

    messagesToSend.push(scoreMessage);

    return messagesToSend;
  }

  private syncGameAndEntitySyncer() {
    const ballState: BallState = {
      x: this.game.ball.position.x,
      y: this.game.ball.position.y,
      dx: this.game.ball.velocity.x,
      dy: this.game.ball.velocity.y,
    };

    this.entitySyncer.setBallState(ballState);
  }
}
