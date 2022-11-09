import { Player } from 'game-core/enum/player';
import { GameEngine } from 'game-core/game-engine';
import { simpleP1KeyMappings } from 'game-core/input/collection/key-mappings';
import { BrowserClient } from '../../src/browser-client/browser-client';
import { basicConfigWithAiOpponent } from '../../src/game-core/config/basic-config';

const rendererElementName = 'game';
const rendererElement = document.getElementById(rendererElementName);
if (rendererElement == null) {
  throw Error(`Element to render to was undefined. There should be an element with the name '${rendererElementName}'`);
}

rendererElement.style.height = `${window.innerHeight}px`;
const game = new GameEngine(basicConfigWithAiOpponent);
const client = new BrowserClient(game, rendererElement, {
  input: { playerToControl: Player.Player1, keyMappings: simpleP1KeyMappings },
});
game.start();
client.start();

window.addEventListener('resize', () => {
  rendererElement.style.height = `${window.innerHeight}px`;
  rendererElement.style.width = `${window.innerWidth}px`;
  client.setSize(window.innerWidth, window.innerHeight);
});
