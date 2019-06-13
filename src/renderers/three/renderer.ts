import Three from "three";
import { Pong3dGameEngine } from "../../core/game-engine";
import { makeTextureFromBase64Image } from "../../util";
import ballTexture from "./images/ball";
import { Pong3dThreeRendererConfig } from "./renderer-config";
import { Pong3dThreeScoreboard } from "./scoreboard/scoreboard";

export class Pong3dThreeRenderer {

  private scene: Three.Scene;
  private camera: Three.PerspectiveCamera;
  private cameraParent = new Three.Group();
  private renderer: Three.WebGLRenderer;
  private config: Pong3dThreeRendererConfig;
  private scoreboard: Pong3dThreeScoreboard;

  private rendering = true;

  public constructor(config: Pong3dThreeRendererConfig) {
    this.config = config;

    const createCamera = (): Three.PerspectiveCamera => {
      const {clippingPlane, position, fov } = config.camera;
      const { near, far } = clippingPlane;
      const aspectRatio = config.width / config.height;

      const camera = new Three.PerspectiveCamera(fov, aspectRatio, near, far);
      camera.position.copy(position);
      camera.lookAt(new Three.Vector3(0, 0, 0));

      return camera;
    };

    const createRenderer = (): Three.WebGLRenderer => {
      const renderer = new Three.WebGLRenderer({antialias: true});
      renderer.setClearColor(config.clearColor, 1.0);
      renderer.setSize(config.width, config.height);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = Three.PCFSoftShadowMap;

      return renderer;
    };

    this.scene = new Three.Scene();
    this.camera = createCamera();
    this.renderer = createRenderer();

    this.cameraParent = new Three.Group();
    this.cameraParent.add(this.camera);

    this.scene.add(this.cameraParent);

    const scoreboard = new Pong3dThreeScoreboard(config.scoreboard.config);
    scoreboard.getObject().position.copy(config.scoreboard.position);
    this.scene.add(scoreboard.getObject());
    this.scoreboard = scoreboard;
  }

  public getRendererDomElement(): HTMLCanvasElement {
    return this.renderer.domElement;
  }

  public startRendering(game: Pong3dGameEngine): void {
    window.addEventListener("resize", this.handleResize, false);
    this.rendering = true;
    this.render(game);
  }

  public stopRendering(): void {
    this.rendering = false;
  }

  private handleResize(): void {
    const domElement = this.renderer.domElement;
    this.camera.aspect = domElement.clientWidth / domElement.clientHeight;
    this.camera.updateProjectionMatrix();
  }

  private render(game: Pong3dGameEngine): void {
    this.performInitialSetup(game);

    if (this.rendering) {
      requestAnimationFrame(() => {
        this.render(game);
      });
    }
  }

  private performInitialSetup(game: Pong3dGameEngine) {
    if (game.westWall.material == null) {
      game.westWall.material = new Three.MeshLambertMaterial({color: this.config.wallColor});
      game.eastWall.material = new Three.MeshLambertMaterial({color: this.config.wallColor});
      this.scene.add(this.createPlayField(game));
      game.player1Paddle.object.material = new Three.MeshLambertMaterial({color: this.config.paddles.player1Color});
      game.player2Paddle.object.material = new Three.MeshLambertMaterial({color: this.config.paddles.player2Color});

      const ballMaterial = new Three.MeshPhongMaterial();
      ballMaterial.map = makeTextureFromBase64Image(ballTexture);
      game.ball.innerObject.material = ballMaterial;
      game.ball.innerObject.receiveShadow = true;
      game.ball.innerObject.castShadow = true;

      this.scene.add(this.createPlayField(game));

      game.eventEmitter.on("ballHitPaddle", () => {
        this.scoreboard.setSpeed(Math.hypot(game.ball.dx, game.ball.dy));
      });

      game.eventEmitter.on("playerScored", () => {
        this.scoreboard.setScore(game.score.player1, game.score.player2);
      });

      game.eventEmitter.on("startingServe", () => {
        this.scoreboard.setSpeed(0); // Clears speed meter.
      });

      game.eventEmitter.on("tick", () => {
        if (game.timeUntilServeSec > 0) {
          this.scoreboard.setServeProgress(game.config.pauseAfterScoreSec / game.timeUntilServeSec);
        }
      });

      game.eventEmitter.on("ballServed", () => {
        this.scoreboard.setServeProgress(0); // Clears meter.
      })
    }
  }

  private createPlayField(game: Pong3dGameEngine) {
    const createPart = (color: number, length: number, yOffset: number) => {
      const geometry = new Three.PlaneGeometry(this.config.width, length, 32, 32);
      const material = new Three.MeshLambertMaterial({color});
      material.side = Three.DoubleSide;
      const part = new Three.Mesh(geometry, material);
      part.receiveShadow = true;
      part.position.set(0, yOffset, 0);

      return part;
    };

    const playPlaneLength = (this.config.height / 2) - (game.config.playField.neutralZoneHeight);
    const playPlanePos = (game.config.playField.neutralZoneHeight / 2) + playPlaneLength / 2;

    const topHalf = createPart(this.config.playField.color, playPlaneLength, playPlanePos);
    const bottomHalf = createPart(this.config.playField.color, playPlaneLength, -playPlanePos);
    const centerline = createPart(0xFFFFFF, game.config.playField.neutralZoneHeight, 0);

    const obj = new Three.Object3D();
    obj.add(topHalf, bottomHalf, centerline);

    return obj;
  }
}
