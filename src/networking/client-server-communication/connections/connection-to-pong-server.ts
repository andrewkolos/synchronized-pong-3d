import { SendableToServer } from "../pong-send-to-server-type-map";
import { ReceivableFromServer } from "../pong-send-to-client-type-map";
import { MessageBuffer } from "@akolos/ts-client-server-game-synchronization";

export type ConnectionToPongServer = MessageBuffer<ReceivableFromServer, SendableToServer>;
