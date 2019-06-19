import { basicConfig } from "../core/config/basic-config";
import { Config } from "../core/config/config";
import { Player } from "../core/enum/player";
import { GameEngine } from "../core/game-engine";
import { BrowserInputCollector,
  BrowserInputCollectorContext } from "../core/input/collection/implementations/browser-input-collector";
import { KeyCode } from "../core/input/collection/key-code";
import { KeyMappings } from "../core/input/collection/key-mappings";
import { PaddleInputApplicator } from "../core/input/paddle-input-applicator";
import { makeSimpleThreeRendererConfig } from "../renderers/three/basic-renderer-config";
import { ThreeRenderer } from "../renderers/three/renderer";
import { ThreeRendererConfig } from "../renderers/three/renderer-config";

export interface BrowserClientOptions {
  gameConfig: Partial<Config>;
  keyMappings: KeyMappings;
  player: Player;
  rendererConfig: Partial<ThreeRendererConfig>;
}

export class BrowserClient {

  private game: GameEngine;
  private renderer: ThreeRenderer;

  public constructor(hostElement: HTMLElement, options?: Partial<BrowserClientOptions>) {

    if (options == null) {
      options = {};
    }

    const game = (() => {
      const baseConfig = basicConfig;
      const suppliedConfig = options.gameConfig;
      const config: Config = {...baseConfig, ...suppliedConfig};
      return new GameEngine(config);
    })();

    const inputCollector = (() => {

      const keyMappings: KeyMappings = options.keyMappings || {
        movePaddleForward: KeyCode.fromKeyName("w"),
        movePaddleLeft: KeyCode.fromKeyName("a"),
        movePaddleBackward: KeyCode.fromKeyName("s"),
        movePaddleRight: KeyCode.fromKeyName("d"),
        rotatePaddleLeft: KeyCode.fromKeyName("q"),
        rotatePaddleRight: KeyCode.fromKeyName("e"),
      };

      const context: BrowserInputCollectorContext = {
        keyMappings,
        game,
        player: options.player != null ? options.player : Player.Player1,
        playerMoveSpeedPerMs: game.config.paddles.baseMoveSpeedPerMs,
      };

      return new BrowserInputCollector(context);
    })();

    const inputApplicator = new PaddleInputApplicator(game);

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
      return new ThreeRenderer(config);
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

  public setSize(width: number, height: number) {
    this.renderer.setSize(width, height);
  }
}
