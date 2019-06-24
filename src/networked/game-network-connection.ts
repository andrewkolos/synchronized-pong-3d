import { Connection, InputMessage, StateMessage } from "@akolos/ts-client-server-game-synchronization";
import { Player } from "core/enum/player";
import { Score } from "core/game-engine";
import { ClientGameMessageType } from "./game synchronization/client-game-message-type";
import { ServerGameMessageType } from "./game synchronization/server-game-message-type";

enum MessageType {
  Entity = "entity",
  Game = "game",
}

interface PaddleServingMessage {
  kind: ServerGameMessageType.ServingPlayerInfo;
  servingPlayer: Player;
  timeUntilServeSec: number;
}

interface ScoreMessage {
  kind: ServerGameMessageType.Score;
  score: Score;
}

interface DisconnectMessage {
  kind: ClientGameMessageType.Disconnect;
}

type ServerGameMessage = PaddleServingMessage | ScoreMessage;
type ClientGameMessage = DisconnectMessage;

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
  getConnection<R extends keyof ReceiveTypeMap, S extends keyof SendTypeMap>()
  : Connection<ReceiveTypeMap[R], SendTypeMap[S]>;
}

export interface PongRouterToServer extends GameNetworkRouter<PongReceiveFromServerTypeMap, PongSendToServerTypeMap> {}
export interface PongRouterToClient extends GameNetworkRouter<PongReceiveFromClientTypeMap, PongSendToClientTypeMap> {}

// interface MessageTypeMappingWithEntity<T> {
//   [MessageType.Entity]: T;
// }

// interface GameNetworkConnection<ReceiveMap, SendMap> {
//   send<T extends keyof SendMap>(payload: SendMap[T]): void;
//   receive<T extends keyof ReceiveMap>(type: T): ReceiveMap[T];
//   receiveAll(): Array<ReceiveMap[keyof ReceiveMap]>;
//   hasNext<T extends keyof ReceiveMap>(type: T): boolean;
// }

// export type ConnectionToGameClient<ReceiveMap extends ReceiveFromClientTypeMap, SendMap extends SendToServerTypeMap>
//  = GameNetworkConnection<ReceiveMap, SendMap>;

// export function adaptSynchronizerFromNetworkConnection
//   <EntityReceiveType, EntitySendType, R extends MessageTypeMappingWithEntity<EntityReceiveType>,
//    S extends MessageTypeMappingWithEntity<EntitySendType>>(connection: GameNetworkConnection<R, S>)
//   : Connection<EntityReceiveType, EntitySendType> {
//   return {
//     hasNext: () => connection.hasNext(MessageType.Entity),
//     send: (message: S[MessageType.Entity]) => connection.send(message),
//     receive: () => connection.receive(MessageType.Entity),
//   };
// }

// export function adaptServerSynchronizerFromNetworkConnection
//   <R extends MessageTypeMappingWithEntity<InputMessage>,
//   S extends MessageTypeMappingWithEntity<StateMessage>>(connection: GameNetworkConnection<R, S>) {
//   return adaptSynchronizerFromNetworkConnection<InputMessage, StateMessage, R, S>(connection);
// }

// export function adaptClientSynchronizerFromNetworkConnection
//   <R extends MessageTypeMappingWithEntity<StateMessage>,
//    S extends MessageTypeMappingWithEntity<InputMessage>>(connection: GameNetworkConnection<R, S>) {
//   return adaptSynchronizerFromNetworkConnection<StateMessage, InputMessage, R, S>(connection);
// }
