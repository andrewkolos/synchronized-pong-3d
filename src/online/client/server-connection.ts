import { InputMessage, ServerConnection, StateMessage } from "@akolos/ts-client-server-game-synchronization";

export class ServerConnection implements ServerConnection {

  public send(message: InputMessage): void {
    throw new Error("Method not implemented.");
  }
  public receive(): StateMessage {
    throw new Error("Method not implemented.");
  }
  public hasNext(): boolean {
    throw new Error("Method not implemented.");
  }
}
