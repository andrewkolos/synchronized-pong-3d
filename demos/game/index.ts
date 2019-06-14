import { Pong3dBrowserClient } from "../../src/browser-client/browser-client";
import { basicPong3dConfigWithAiOpponent } from "../../src/core/config/basic-config";

const client = new Pong3dBrowserClient(document.body, {gameConfig: basicPong3dConfigWithAiOpponent});
client.startGame();
