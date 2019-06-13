import { basicPong3dConfigWithAiOpponent } from "../core/config/basic-config";
import { Player } from "../core/enum/player";
import { Pong3dGameEngine } from "../core/game-engine";
import { Pong3dBrowserInputCollector,
  Pong3DBrowserInputCollectorContext } from "../core/input/collection/browser-input-collector";
import { KeyCode } from "../core/input/collection/key-code";
import { Pong3DKeyMappings } from "../core/input/collection/key-mappings";
import { Pong3dInputApplicator } from "../core/input/input-applicator";
import { generateSimpleThreeRendererConfig } from "../renderers/three/basic-renderer-config";
import { Pong3dThreeRenderer } from "../renderers/three/renderer";

const game = (() => {
  const config = basicPong3dConfigWithAiOpponent;
  return new Pong3dGameEngine(config);
})();

const inputCollector = (() => {

  const keyMappings: Pong3DKeyMappings = {
    movePaddleForward: KeyCode.fromKeyName("w"),
    movePaddleLeft: KeyCode.fromKeyName("a"),
    movePaddleBackward: KeyCode.fromKeyName("s"),
    movePaddleRight: KeyCode.fromKeyName("d"),
    rotatePaddleLeft: KeyCode.fromKeyName("q"),
    rotatePaddleRight: KeyCode.fromKeyName("e"),
  };

  const context: Pong3DBrowserInputCollectorContext = {
    keyMappings,
    game,
    playerPaddle: game.player1Paddle.object,
  };

  return new Pong3dBrowserInputCollector(context);
})();

const inputApplicator = new Pong3dInputApplicator(game);

let lastTickTime = new Date().getTime();
game.eventEmitter.on("tick", () => {
  const currentTime = new Date().getTime();
  const dt = currentTime - lastTickTime;
  inputApplicator.applyInput({player: Player.Player1, ...inputCollector.getPaddleMoveInput(dt)});
  lastTickTime = currentTime;
});

const renderer = (() => {
  const config = generateSimpleThreeRendererConfig(window.innerWidth, window.outerWidth);
  return new Pong3dThreeRenderer(config);
})();

game.start();

const domElement = renderer.getRendererDomElement();
document.body.appendChild(domElement);
renderer.startRendering(game);
