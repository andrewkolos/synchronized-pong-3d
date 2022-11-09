import { Player } from '../game-core/enum/player';
import { GameEngine } from '../game-core/game-engine';
import {
  BrowserInputCollector,
  BrowserInputCollectorContext,
} from '../game-core/input/collection/implementations/browser-input-collector';
import { KeyMappings } from '../game-core/input/collection/key-mappings';
import { PaddleInputApplicator } from '../game-core/input/paddle-input-applicator';
import { makeSimpleThreeRendererConfig } from '../renderers/three/basic-renderer-config';
import { ThreeRenderer } from '../renderers/three/renderer';
import { ThreeRendererConfig } from '../renderers/three/renderer-config';
import { AudioManager } from './audio/audio-manager';

export interface BrowserClientOptions {
  pov?: Player;
  input?: {
    playerToControl: Player;
    keyMappings: KeyMappings;
  };
  rendererConfig?: Partial<ThreeRendererConfig>;
}

export class BrowserClient {
  public readonly game: GameEngine;

  private renderer: ThreeRenderer;

  private audioManager: AudioManager;

  private running = false;

  public constructor(game: GameEngine, hostElement: HTMLElement, options: BrowserClientOptions = {}) {
    const pov: Player = options.pov != null ? options.pov : Player.Player1;

    this.game = game;

    if (options.input != null) {
      this.setupBrowserInput(options.input.playerToControl, options.input.keyMappings);
    }

    game.eventEmitter.on('ballHitPaddle', this.playBounceSound.bind(this));
    game.eventEmitter.on('ballHitWall', this.playBounceSound.bind(this));
    game.eventEmitter.on('playerScored', this.playApplause.bind(this));

    const renderer = (() => {
      const rendererWidth = hostElement.clientWidth;
      const rendererHeight = hostElement.clientHeight;
      const config = {
        ...makeSimpleThreeRendererConfig(rendererWidth, rendererHeight, pov),
        ...options.rendererConfig,
      };
      return new ThreeRenderer(config);
    })();

    const domElement = renderer.getRendererDomElement();
    hostElement.appendChild(domElement);

    this.renderer = renderer;
    this.audioManager = new AudioManager(game.config.ball.speedLimit);
  }

  public start() {
    this.renderer.startRendering(this.game);
    this.running = true;
  }

  public stop() {
    this.renderer.stopRendering();
    this.running = false;
  }

  public setSize(width: number, height: number) {
    this.renderer.setSize(width, height);
  }

  private setupBrowserInput(player: Player, keyMappings: KeyMappings) {
    const { game } = this;
    const inputCollector = (() => {
      const context: BrowserInputCollectorContext = {
        keyMappings,
        game,
        player,
        playerMoveSpeedPerMs: game.config.paddles.baseMoveSpeedPerMs,
        playerRotateSpeedPerMs: game.config.paddles.baseRotateSpeedPerMs,
      };

      return new BrowserInputCollector(context);
    })();

    const inputApplicator = new PaddleInputApplicator(game);

    let lastTickTime = new Date().getTime();
    game.eventEmitter.on('tick', () => {
      const currentTime = new Date().getTime();
      const dt = currentTime - lastTickTime;
      inputApplicator.applyInput({ player: Player.Player1, ...inputCollector.getPaddleMoveInput(dt) });
      lastTickTime = currentTime;
    });
  }

  private playBounceSound() {
    if (this.running) {
      this.audioManager.playBounce(this.game.ball.velocity.length());
    }
  }

  private playApplause() {
    if (this.running) {
      this.audioManager.playCheer();
    }
  }
}
