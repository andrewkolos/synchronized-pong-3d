import * as Three from "three";
import { OrbitControls } from "three-orbitcontrols-ts";
import { Pong3dGameEngine } from "../../core/game-engine";
import { makeTextureFromBase64Image } from "../../util";
import ballTexture from "./images/ball";
import { Pong3dThreeRendererConfig } from "./renderer-config";
import { MeterType, Pong3dThreeScoreboard } from "./scoreboard/scoreboard";
import { SevenSegmentDisplay } from "./scoreboard/seven segment display/seven-segment-display";

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
      const { clippingPlane, position, fov } = config.camera;
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

    // tslint:disable-next-line: no-unused-expression
    new OrbitControls(this.camera, this.renderer.domElement);

    const scoreboard = new Pong3dThreeScoreboard(config.scoreboard);
    scoreboard.getObject().position.copy(config.scoreboard.position);
    this.scene.add(scoreboard.getObject());
    this.scoreboard = scoreboard;
  }

  public getRendererDomElement(): HTMLCanvasElement {
    return this.renderer.domElement;
  }

  public startRendering(game: Pong3dGameEngine): void {
    this.rendering = true;
    this.render(game);
  }

  public stopRendering(): void {
    this.rendering = false;
  }

  public setSize(width: number, height: number): void {
    this.renderer.setSize(width, height);

    const domElement = this.renderer.domElement;
    this.camera.aspect = domElement.clientWidth / domElement.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(domElement.clientWidth, domElement.clientHeight);
  }

  private render(game: Pong3dGameEngine): void {
    this.performInitialSetup(game);

    if (this.rendering) {
      requestAnimationFrame(() => {
        this.renderer.render(this.scene, this.camera);
        this.render(game);
      });
    }
  }

  private performInitialSetup(game: Pong3dGameEngine) {

    const enableShadows = (obj: Three.Object3D) => {
      obj.castShadow = true;
      obj.receiveShadow = true;
    };

    const createWalls = () => {
      const playFieldWidth = game.config.playField.width;
      const playFieldHeight = game.config.playField.height;
      const playFieldDepth = this.config.playField.height;

      const wallWidth = this.config.walls.width;
      const wallHeight = this.config.walls.height;

      const createWall = () => {
        const geo = new Three.BoxGeometry(wallWidth, playFieldHeight, wallHeight);
        const mat = new Three.MeshLambertMaterial({color: this.config.wallColor});
        return new Three.Mesh(geo, mat);
      };

      const eastWall = createWall();
      eastWall.position.x = -playFieldWidth / 2 - wallWidth / 2,
      eastWall.position.z = wallHeight / 2 - playFieldDepth / 2;

      const westWall = createWall();
      westWall.position.x = playFieldWidth / 2 + wallWidth / 2;
      westWall.position.z = wallHeight / 2 - playFieldDepth / 2;

      return { eastWall, westWall };
    };

    if (!(game.player1Paddle.object.material instanceof Three.MeshLambertMaterial)) {

      const { eastWall, westWall } = createWalls();
      enableShadows(westWall);
      enableShadows(eastWall);
      this.scene.add(eastWall);
      this.scene.add(westWall);

      game.player1Paddle.object.material = new Three.MeshLambertMaterial({color: this.config.paddles.player1Color});
      game.player2Paddle.object.material = new Three.MeshLambertMaterial({color: this.config.paddles.player2Color});
      enableShadows(game.player1Paddle.object);
      enableShadows(game.player2Paddle.object);
      this.scene.add(game.player1Paddle.object);
      this.scene.add(game.player2Paddle.object);

      const ballMaterial = new Three.MeshPhongMaterial();
      ballMaterial.map = makeTextureFromBase64Image(ballTexture);
      game.ball.innerObject.material = ballMaterial;
      enableShadows(game.ball.innerObject);
      this.scene.add(game.ball.object);

      this.scene.add(this.createPlayField(game));

      game.eventEmitter.on("ballHitPaddle", () => {
        this.scoreboard.setSpeed(Math.hypot(game.ball.dx, game.ball.dy));
      });

      game.eventEmitter.on("playerScored", () => {
        this.scoreboard.setSpeed(0); // Clears speed meter.
        this.scoreboard.showMeter(MeterType.ServeProgress);
        this.scoreboard.setScore(game.score.player1, game.score.player2);
      });

      game.eventEmitter.on("startingServe", () => {
        this.scoreboard.showMeter(MeterType.Speed);
      });

      game.eventEmitter.on("tick", () => {
        if (game.timeUntilServeSec > 0) {
          const timePassed = game.config.pauseAfterScoreSec - game.timeUntilServeSec;
          const serveProgress = timePassed / game.config.pauseAfterScoreSec;
          this.scoreboard.setServeProgress(serveProgress);
        }
      });

      game.eventEmitter.on("ballServed", () => {
        this.scoreboard.showMeter(MeterType.Speed);
        this.scoreboard.setServeProgress(0);
      });

      this.addLighting();
    }
  }

  private createPlayField(game: Pong3dGameEngine) {
    const createPart = (color: number, length: number, yOffset: number) => {
      const geometry = new Three.BoxGeometry(game.config.playField.width, length, this.config.playField.height, 32, 32);
      const material = new Three.MeshLambertMaterial({color});
      material.side = Three.DoubleSide;
      const part = new Three.Mesh(geometry, material);
      part.receiveShadow = true;
      part.position.set(0, yOffset, 0);

      return part;
    };

    const playPlaneLength = (game.config.playField.height / 2) - (game.config.playField.neutralZoneHeight) / 2;
    const playPlanePos = (game.config.playField.neutralZoneHeight / 2) + playPlaneLength / 2;

    const topHalf = createPart(this.config.playField.color, playPlaneLength, playPlanePos);
    const bottomHalf = createPart(this.config.playField.color, playPlaneLength, -playPlanePos);
    const centerline = createPart(0xFFFFFF, game.config.playField.neutralZoneHeight, 0);

    const obj = new Three.Object3D();
    obj.add(topHalf, bottomHalf, centerline);

    return obj;
  }

  private addLighting(): void {
    const config = this.config.lighting;

    const createDirLight = () => {
      const dlConfig = config.directionalLight;
      const light = new Three.DirectionalLight(0xffffff, dlConfig.brightness);
      light.position.copy(dlConfig.position);
      light.castShadow = true;
      Object.assign(light.shadow.camera, dlConfig.shadow);
      light.shadow.mapSize.width = 2048;
      light.shadow.mapSize.height = 2048;
      return light;
    };

    const createScoreboardLight = () => {
      const slConfig = config.scoreLight;
      const light = new Three.SpotLight(0xffffff, slConfig.brightness);
      light.position.copy(slConfig.position);
      light.target = this.scoreboard.getObject();
      light.angle = slConfig.angle;
      light.distance = slConfig.distance;
      light.castShadow = true;
      light.shadow.camera.near = 0.1;
      light.shadow.camera.far = slConfig.distance;
      light.shadow.mapSize.width = 1024;
      light.shadow.mapSize.height = 1024;

      light.target.updateMatrixWorld();

      return light;
    };

    const createHemiLight = () => {
      const hlConfig = config.hemisphericalLight;
      const light = new Three.HemisphereLight(0xffffff, 0xffffff, hlConfig.brightness);
      light.color.setHSL(0.6, 1, 0.6);
      light.groundColor.setHSL(0.095, 1, 0.75);
      light.position.copy(hlConfig.position);

      return light;
    };

    const createAmbientLight = () => {
      const alConfig = config.ambientLight;
      const light = new Three.AmbientLight(0xffffff, alConfig.brightness);
      return light;
    };

    const dirLight = createDirLight();
    const ambientLight = createAmbientLight();
    const hemisphereLight = createHemiLight();
    const scoreboardLight = createScoreboardLight();

    this.scene.add(dirLight);
    this.scene.add(ambientLight);
    this.scene.add(hemisphereLight);
    this.scene.add(scoreboardLight);
  }
}
