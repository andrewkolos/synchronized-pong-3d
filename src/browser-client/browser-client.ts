import { basicPong3dConfig } from "../core/config/basic-config";
import { Pong3dConfig } from "../core/config/config";
import { Player } from "../core/enum/player";
import { Pong3dGameEngine } from "../core/game-engine";
import { Pong3dBrowserInputCollector,
  Pong3DBrowserInputCollectorContext } from "../core/input/collection/browser-input-collector";
import { KeyCode } from "../core/input/collection/key-code";
import { Pong3DKeyMappings } from "../core/input/collection/key-mappings";
import { Pong3dInputApplicator } from "../core/input/input-applicator";
import { makeSimpleThreeRendererConfig } from "../renderers/three/basic-renderer-config";
import { Pong3dThreeRenderer } from "../renderers/three/renderer";
import { Pong3dThreeRendererConfig } from "../renderers/three/renderer-config";

export interface Pong3dBrowserClientOptions {
  gameConfig: Partial<Pong3dConfig>;
  keyMappings: Pong3DKeyMappings;
  player: Player;
  rendererConfig: Partial<Pong3dThreeRendererConfig>;
}

export class Pong3dBrowserClient {

  private game: Pong3dGameEngine;
  private renderer: Pong3dThreeRenderer;

  public constructor(hostElement: HTMLElement, options?: Partial<Pong3dBrowserClientOptions>) {

    if (options == null) {
      options = {};
    }

    const game = (() => {
      const baseConfig = basicPong3dConfig;
      const suppliedConfig = options.gameConfig;
      const config: Pong3dConfig = {...baseConfig, ...suppliedConfig};
      return new Pong3dGameEngine(config);
    })();

    const inputCollector = (() => {

      const keyMappings: Pong3DKeyMappings = options.keyMappings || {
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
        playerPaddle: options.player === Player.Player2 ? game.player2Paddle.object : game.player1Paddle.object,
      };

      return new Pong3dBrowserInputCollector(context);
    })();

    const inputApplicator = new Pong3dInputApplicator(game);

    let lastTickTime = new Date().getTime();
    game.eventEmitter.on("tick", () => {
      const currentTime = new Date().getTime();
      const dt = currentTime - lastTickTime;
      inputApplicator.applyInput({ player: Player.Player1, ...inputCollector.getPaddleMoveInput(dt) });
      lastTickTime = currentTime;
    });

    const renderer = (() => {
      const rendererWidth = hostElement.clientWidth;
      const rendererHeight = hostElement.clientHeight;
      const config = {...makeSimpleThreeRendererConfig(rendererWidth, rendererHeight), ...options.rendererConfig};
      return new Pong3dThreeRenderer(config);
    })();

    const domElement = renderer.getRendererDomElement();
    hostElement.appendChild(domElement);

    this.game = game;
    this.renderer = renderer;
  }

  public startGame() {
    this.game.start();
    this.renderer.startRendering(this.game);
  }

  public stopGame() {
    this.game.stop();
    this.renderer.stopRendering();
  }
}
