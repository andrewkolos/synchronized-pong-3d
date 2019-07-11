import { MessageCategorizer, StateMessage, InputMessage, EntityMessageKind } from "@akolos/ts-client-server-game-synchronization";
import { ClientMessageTypeMap, ServerMessageTypeMap } from "../pong-send-to-client-type-map";
import { PongEntity } from 'networking/entities/pong-entity';
import { PaddleServingMessage } from '../messages/sent-from-server/paddle-serving-message';
import { ScoreMessage } from '../messages/sent-from-server/score-message';
import { MessageType } from '../message-type';
import { DisconnectMessage } from '../messages/sent-from-client/disconnect-message';
import { ServerGameMessageKind } from '../messages/sent-from-server/server-game-message-kind';
import { ClientGameMessageKind } from '../messages/sent-from-client/client-game-message-kind';

export class ClientMessageCategorizer implements MessageCategorizer<ClientMessageTypeMap> {
  public assignMessageCategory(message: StateMessage<PongEntity> | PaddleServingMessage | ScoreMessage): MessageType {
    switch (message.kind) {
      case ServerGameMessageKind.Score:
      case ServerGameMessageKind.ServingPlayerInfo:
        return MessageType.Game;
      case EntityMessageKind.State:
        return MessageType.Entity;
      default:
        throw Error("Unable to categorize client message.");
    }
  }
}

export class ServerMessageCategorizer implements MessageCategorizer<ServerMessageTypeMap> {
  assignMessageCategory(message: InputMessage<PongEntity> | DisconnectMessage): MessageType {
    switch (message.kind) {
      case ClientGameMessageKind.Disconnect:
        return MessageType.Connection;
      case EntityMessageKind.Input:
        return MessageType.Entity;
      default:
        throw Error("Unable to categorize server message.");
    }
  }
}
