import { ServerConnection, StateMessage, InputMessage } from '@akolos/ts-client-server-game-synchronization';

export class Pong3dServerConnection implements ServerConnection {

  send(message: InputMessage): void {
    throw new Error('Method not implemented.');
  } 
  receive(): StateMessage {
    throw new Error('Method not implemented.');
  }
  hasNext(): boolean {
    throw new Error('Method not implemented.');
  }
}
