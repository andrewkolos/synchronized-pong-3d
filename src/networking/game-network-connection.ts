import { Connection, InputMessage, StateMessage } from "@akolos/ts-client-server-game-synchronization";
import { Player } from "game-core/enum/player";
import { Score } from "game-core/game-engine";
import { ClientGameMessageType } from "./message-types/client-game-message-type";
import { ServerGameMessageType } from "./message-types/server-game-message-type";

export enum MessageType {
  Entity = "entity",
  Game = "game",
}

export interface PaddleServingMessage {
  kind: ServerGameMessageType.ServingPlayerInfo;
  servingPlayer: Player;
  timeUntilServeSec: number;
}

export interface ScoreMessage {
  kind: ServerGameMessageType.Score;
  score: Score;
}

export interface DisconnectMessage {
  kind: ClientGameMessageType.Disconnect;
}

export type ServerGameMessage = PaddleServingMessage | ScoreMessage;
export type ClientGameMessage = DisconnectMessage;

export interface PongSendToServerTypeMap {
  [MessageType.Entity]: InputMessage;
  [MessageType.Game]: ClientGameMessage;
}

export interface PongSendToClientTypeMap {
  [MessageType.Entity]: StateMessage;
  [MessageType.Game]: ServerGameMessage;
}

export type PongReceiveFromServerTypeMap = PongSendToClientTypeMap;
export type PongReceiveFromClientTypeMap = PongSendToServerTypeMap;

export interface GameNetworkRouter<ReceiveTypeMap, SendTypeMap> {
  getConnection<R extends keyof ReceiveTypeMap, S extends keyof SendTypeMap>(receiveType: R, sendType: S)
  : Connection<ReceiveTypeMap[R], SendTypeMap[S]>;
}

export interface PongRouterToServer extends GameNetworkRouter<PongReceiveFromServerTypeMap, PongSendToServerTypeMap> {}
export interface PongRouterToClient extends GameNetworkRouter<PongReceiveFromClientTypeMap, PongSendToClientTypeMap> {}