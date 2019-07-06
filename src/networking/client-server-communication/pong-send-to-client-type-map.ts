import { ServerGameMessage } from "./messages/sent-from-server/server-game-message";
import { StateMessage, InputMessage, InvertRouterTypeMap } from "@akolos/ts-client-server-game-synchronization";
import { MessageType } from "./message-type";
import { ValueOf } from "misc/value-of";
import { DisconnectMessage } from "./messages/sent-from-client/disconnect-message";
import { PongEntity } from 'networking/entities/pong-entity';

export interface PongSendToClientTypeMap {
  [MessageType.Entity]: StateMessage<PongEntity>;
  [MessageType.Game]: ServerGameMessage;
  [MessageType.Connection]: never;
}

export type SendableToClient = ValueOf<PongSendToClientTypeMap>;
export type ReceivableFromServer = SendableToClient;

export type PongReceiveFromServerTypeMap = PongSendToClientTypeMap;

export type ClientMessageTypeMap = {
  [MessageType.Entity]: {receiveType: StateMessage<PongEntity>, sendType: InputMessage<PongEntity>};
  [MessageType.Game]: {receiveType: ServerGameMessage, sendType: never};
  [MessageType.Connection]: {receiveType: never, sendType: DisconnectMessage};
}

export type ServerMessageTypeMap = InvertRouterTypeMap<ClientMessageTypeMap>;
