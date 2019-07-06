import { ServerGameMessageKind } from "./server-game-message-kind";
import { Player } from "game-core/enum/player";

export interface PaddleServingMessage {
  kind: ServerGameMessageKind.ServingPlayerInfo;
  servingPlayer: Player;
  timeUntilServeSec: number;
}
