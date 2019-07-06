import { MessageBufferProcessor, MessageBuffer } from "@akolos/ts-client-server-game-synchronization";
import { ServerGameMessage } from "networking/client-server-communication/messages/sent-from-server/server-game-message";
import { GameEngine } from "game-core/game-engine";
import { ServerGameMessageKind } from "networking/client-server-communication/messages/sent-from-server/server-game-message-kind";
import { ScoreMessage } from "networking/client-server-communication/messages/sent-from-server/score-message";
import { PaddleServingMessage } from "networking/client-server-communication/messages/sent-from-server/paddle-serving-message";

export class PongGameMessageSyncer extends MessageBufferProcessor<ServerGameMessage> {

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
    this.game.score = message.score;
  }
  private processServingMessage(message: PaddleServingMessage) {
    this.game.server = message.servingPlayer;
    this.game.timeUntilServeSec = message.timeUntilServeSec;
  }

}
