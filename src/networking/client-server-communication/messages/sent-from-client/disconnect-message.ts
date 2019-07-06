import { ClientGameMessageKind } from "./client-game-message-kind";

export interface DisconnectMessage {
  kind: ClientGameMessageKind.Disconnect;
}
