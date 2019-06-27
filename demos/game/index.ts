import { BrowserClient } from "../../src/browser-client/browser-client";
import { basicConfigWithAiOpponent } from "../../src/game-core/config/basic-config";

const rendererElement = document.getElementById("game");
rendererElement!.style.height = `${window.innerHeight}px`;
const client = new BrowserClient(rendererElement!, {gameConfig: basicConfigWithAiOpponent});
client.startGame();

window.addEventListener("resize", () => {
  rendererElement!.style.height = `${window.innerHeight}px`;
  rendererElement!.style.width = `${window.innerWidth}px`;
  client.setSize(window.innerWidth, window.innerHeight);
});
