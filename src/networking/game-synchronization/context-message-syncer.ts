import { MessageBufferProcessor, MessageBuffer, TypedEventEmitter } from "@akolos/ts-client-server-game-synchronization";
import { ServerGameMessage } from "networking/client-server-communication/messages/sent-from-server/server-game-message";
import { GameEngine } from "game-core/game-engine";
import { ServerGameMessageKind } from "networking/client-server-communication/messages/sent-from-server/server-game-message-kind";
import { ScoreMessage } from "networking/client-server-communication/messages/sent-from-server/score-message";
import { PaddleServingMessage } from "networking/client-server-communication/messages/sent-from-server/paddle-serving-message";
import { cloneDumbObject } from 'misc/cloneDumbObject';

export interface PongGameMessageSyncerEvents {
  scoreChanged(): void;
}

export class PongGameMessageSyncer extends MessageBufferProcessor<ServerGameMessage> {

  public readonly eventEmitter: TypedEventEmitter<PongGameMessageSyncerEvents> = new TypedEventEmitter();

  public constructor(private game: GameEngine, buffer: MessageBuffer<ServerGameMessage, never>, syncRateHz: number) {
    super(buffer, syncRateHz);
  }

  protected processMessage(message: ServerGameMessage): void {
    switch (message.kind) {
      case ServerGameMessageKind.Score:
        this.processScoreMessage(message);
        break;
      case ServerGameMessageKind.ServingPlayerInfo:
        this.processServingMessage(message);
        break;
    }
  }

  private processScoreMessage(message: ScoreMessage) {
    if (this.game.score.player1 !== message.score.player1 ||
      this.game.score.player2 !== message.score.player2) {

      const previousScore = cloneDumbObject(this.game.score);
      const currentScore = cloneDumbObject(message.score);

      Object.assign(this.game.score, message.score);

      this.game.eventEmitter.emit("scoreChanged", previousScore, currentScore);
    }
  }

  private processServingMessage(message: PaddleServingMessage) {
    this.game.server = message.servingPlayer;
    this.game.timeUntilServeSec = message.timeUntilServeSec;
  }

}
