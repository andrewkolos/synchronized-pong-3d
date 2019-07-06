import { MessageRouter } from "@akolos/ts-client-server-game-synchronization";
import { ClientMessageTypeMap } from "../pong-send-to-client-type-map";

export type PongRouterToServer = MessageRouter<ClientMessageTypeMap>;
