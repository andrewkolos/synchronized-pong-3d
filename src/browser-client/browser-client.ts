import { basicConfig } from "../game-core/config/basic-config";
import { Config } from "../game-core/config/config";
import { Player } from "../game-core/enum/player";
import { GameEngine } from "../game-core/game-engine";
import { BrowserInputCollector,
  BrowserInputCollectorContext } from "../game-core/input/collection/implementations/browser-input-collector";
import { KeyMappings } from "../game-core/input/collection/key-mappings";
import { simpleKeyMappings } from "../game-core/input/collection/simple-key-mappings";
import { PaddleInputApplicator } from "../game-core/input/paddle-input-applicator";
import { makeSimpleThreeRendererConfig } from "../renderers/three/basic-renderer-config";
import { ThreeRenderer } from "../renderers/three/renderer";
import { ThreeRendererConfig } from "../renderers/three/renderer-config";
import { AudioManager } from "./audio/audio-manager";

export interface BrowserClientOptions {
  gameConfig: Config;
  keyMappings: KeyMappings;
  player: Player;
  rendererConfig: Partial<ThreeRendererConfig>;
}

export class BrowserClient {

  public readonly game: GameEngine;
  private renderer: ThreeRenderer;

  private audioManager: AudioManager;

  public constructor(hostElement: HTMLElement, options: Partial<BrowserClientOptions>) {

    const game = (() => {
      const baseConfig = basicConfig;
      const suppliedConfig = options.gameConfig;
      const config: Config = {...baseConfig, ...suppliedConfig};
      return new GameEngine(config);
    })();

    const inputCollector = (() => {

      const keyMappings: KeyMappings = options.keyMappings || simpleKeyMappings;

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

    game.eventEmitter.on("ballHitPaddle", this.playBounceSound.bind(this));
    game.eventEmitter.on("ballHitWall", this.playBounceSound.bind(this));
    game.eventEmitter.on("playerScored", this.playApplause.bind(this));

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
    this.audioManager = new AudioManager(game.config.ball.speedLimit);
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

  private playBounceSound() {
    this.audioManager.playBounce(this.game.ball.velocity.length());
  }

  private playApplause() {
    this.audioManager.playCheer();
  }
}
