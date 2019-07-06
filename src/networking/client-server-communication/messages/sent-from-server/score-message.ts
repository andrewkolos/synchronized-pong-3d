import { ServerGameMessageKind
  } from "networking/client-server-communication/messages/sent-from-server/server-game-message-kind";
import { Score } from "game-core/game-engine";

export interface ScoreMessage {
  kind: ServerGameMessageKind.Score;
  score: Score;
}
