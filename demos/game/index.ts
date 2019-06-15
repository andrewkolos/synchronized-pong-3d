import { Pong3dBrowserClient } from "../../src/browser-client/browser-client";
import { basicPong3dConfigWithAiOpponent } from "../../src/core/config/basic-config";

const rendererElement = document.getElementById("game");
rendererElement!.style.height = `${window.innerHeight}px`;
const client = new Pong3dBrowserClient(rendererElement!, {gameConfig: basicPong3dConfigWithAiOpponent});
client.startGame();

window.addEventListener("resize", () => {
  rendererElement!.style.height = `${window.innerHeight}px`;
  rendererElement!.style.width = `${window.innerWidth}px`;
  client.setSize(window.innerWidth, window.innerHeight);
});
