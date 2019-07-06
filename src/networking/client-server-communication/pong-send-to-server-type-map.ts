import { MessageType } from "./message-type";
import { ValueOf } from "misc/value-of";
import { InputMessage } from "@akolos/ts-client-server-game-synchronization";
import { DisconnectMessage } from "./messages/sent-from-client/disconnect-message";
import { PongEntity } from 'networking/entities/pong-entity';

export interface PongSendToServerTypeMap {
  [MessageType.Entity]: InputMessage<PongEntity>;
  [MessageType.Game]: never;
  [MessageType.Connection]: DisconnectMessage;
}

export type SendableToServer = ValueOf<PongSendToServerTypeMap>;
export type ReceivableFromClient = SendableToServer;

export type PongReceiveFromClientTypeMap = PongSendToServerTypeMap;
