import * as Three from "three";
import { OrbitControls } from "three-orbitcontrols-ts";
import { GameEngine } from "../../core/game-engine";
import { Paddle } from "../../core/paddle";
import { makeTextureFromBase64Image } from "../../common";
import ballTexture from "./images/ball";
import { ThreeRendererConfig } from "./renderer-config";
import { MeterType, ThreeScoreboard } from "./scoreboard/scoreboard";

export class ThreeRenderer {

  private scene: Three.Scene;
  private camera: Three.PerspectiveCamera;
  private cameraParent = new Three.Group();
  private renderer: Three.WebGLRenderer;
  private config: ThreeRendererConfig;
  private scoreboard: ThreeScoreboard;

  private gameObjects?: {
    ball: { outerObj: Three.Group, innerObj: Three.Mesh };
    player1Paddle: Three.Mesh;
    player2Paddle: Three.Mesh;
  };

  private rendering = true;

  public constructor(config: ThreeRendererConfig) {
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
      const renderer = new Three.WebGLRenderer({ antialias: true });
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

    const scoreboard = new ThreeScoreboard(config.scoreboard);
    scoreboard.getObject().position.copy(config.scoreboard.position);
    this.scene.add(scoreboard.getObject());
    this.scoreboard = scoreboard;
  }

  public getRendererDomElement(): HTMLCanvasElement {
    return this.renderer.domElement;
  }

  public startRendering(game: GameEngine): void {
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

  private render(game: GameEngine): void {
    this.performInitialSetup(game);

    if (this.rendering) {
      requestAnimationFrame(() => {
        this.renderer.render(this.scene, this.camera);
        this.render(game);
      });
    }
  }

  private performInitialSetup(game: GameEngine) {

    const enableShadows = (obj: Three.Object3D) => {
      obj.castShadow = true;
      obj.receiveShadow = true;
    };

    const createWalls = () => {
      const playFieldWidth = game.config.playField.width;
      const playFieldHeight = game.config.playField.height;
      const playFieldDepth = this.config.playField.depth;

      const wallWidth = this.config.walls.width;
      const wallHeight = this.config.walls.depth;

      const createWall = () => {
        const geo = new Three.BoxGeometry(wallWidth, playFieldHeight, wallHeight);
        const mat = new Three.MeshLambertMaterial({ color: this.config.wallColor });
        const wall = new Three.Mesh(geo, mat);
        enableShadows(wall);
        return wall;
      };

      const eastWall = createWall();
      eastWall.position.x = -playFieldWidth / 2 - wallWidth / 2,
        eastWall.position.z = wallHeight / 2 - playFieldDepth;

      const westWall = createWall();
      westWall.position.x = playFieldWidth / 2 + wallWidth / 2;
      westWall.position.z = wallHeight / 2 - playFieldDepth;

      return { eastWall, westWall };
    };

    const createBall = () => {
      const outerObj = new Three.Group();
      const ballGeometry = new Three.SphereGeometry(game.ball.radius, 32, 32);
      const ballMaterial = new Three.MeshPhongMaterial();
      ballMaterial.map = makeTextureFromBase64Image(ballTexture);
      const innerObj = new Three.Mesh(ballGeometry, ballMaterial);

      outerObj.position.z = game.ball.radius;

      enableShadows(innerObj);
      outerObj.add(innerObj);
      return { outerObj, innerObj };
    };

    const createPaddles = () => {
      const createPaddle = (paddle: Paddle, color: number): Three.Mesh => {
        const geometry = new Three.BoxGeometry(paddle.width, paddle.height, this.config.walls.depth);
        const material = new Three.MeshLambertMaterial({ color });
        const paddleObj = new Three.Mesh(geometry, material);

        paddleObj.position.set(paddle.position.x, paddle.position.y, this.config.walls.depth / 2);
        enableShadows(paddleObj);

        return paddleObj;
      };
      return {
        player1Paddle: createPaddle(game.player1Paddle, this.config.paddles.player1Color),
        player2Paddle: createPaddle(game.player2Paddle, this.config.paddles.player2Color),
      };
    };

    if (this.gameObjects == null) {

      const { eastWall, westWall } = createWalls();
      this.scene.add(eastWall);
      this.scene.add(westWall);

      const { player1Paddle, player2Paddle } = createPaddles();
      this.scene.add(player1Paddle);
      this.scene.add(player2Paddle);

      const ball = createBall();
      this.scene.add(ball.outerObj);

      this.scene.add(this.createPlayField(game));

      this.addLighting();

      this.gameObjects = {
        ball,
        player1Paddle,
        player2Paddle,
      };

      game.eventEmitter.on("ballHitPaddle", () => {
        this.scoreboard.setSpeed(Math.hypot(game.ball.velocity.x, game.ball.velocity.y));
      });

      game.eventEmitter.on("playerScored", () => {
        this.scoreboard.setSpeed(0);
        this.scoreboard.setScore(game.score.player1, game.score.player2);
      });

      game.eventEmitter.on("startingServe", () => {
        this.scoreboard.showMeter(MeterType.ServeProgress);
      });

      game.eventEmitter.on("tick", () => this.update(game));

      game.eventEmitter.on("ballServed", () => {
        this.scoreboard.showMeter(MeterType.Speed);
        this.scoreboard.setServeProgress(0);
      });
    }
  }

  private createPlayField(game: GameEngine) {
    const createPart = (color: number, length: number, yOffset: number) => {
      const geometry = new Three.BoxGeometry(game.config.playField.width, length, this.config.playField.depth, 32, 32);
      const material = new Three.MeshLambertMaterial({ color });
      material.side = Three.DoubleSide;
      const part = new Three.Mesh(geometry, material);
      part.receiveShadow = true;
      part.position.set(0, yOffset, -this.config.playField.depth / 2);

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

  private update(game: GameEngine) {
    const updatePaddleObj = (obj: Three.Mesh, paddle: Paddle) => {
      obj.position.x = paddle.position.x;
      obj.position.y = paddle.position.y;
      obj.rotation.z = paddle.zRotationEulers;
    };

    const updateBall = (obj: { outerObj: Three.Group, innerObj: Three.Mesh }) => {
      obj.outerObj.position.x = game.ball.position.x;
      obj.outerObj.position.y = game.ball.position.y;

      const distanceTraveled = Math.hypot(game.ball.velocity.x, game.ball.velocity.y);

      const angle = distanceTraveled / game.ball.radius;
      const axisOfRotation = new Three.Vector3(-game.ball.velocity.y, game.ball.velocity.x, 0).normalize();
      const rotation = new Three.Matrix4();
      rotation.makeRotationAxis(axisOfRotation, angle);
      obj.innerObj.applyMatrix(rotation);
    };

    const updateScreenShake = () => {
      const shakeFactor = (game.ball.velocity.length() - this.config.screenShake.minSpeed) /
        (this.config.screenShake.maxSpeed / this.config.screenShake.minSpeed);

      if (shakeFactor > 0) {
        const colorIntensity = Math.floor(0x77 * Math.sqrt(Math.min(shakeFactor, 1))); // Math.sqrt creates a curve.
        const bgColor = colorIntensity * 0x10000; // Moves value into red digits.
        this.renderer.setClearColor(bgColor, 1);

        const shakeX = (Math.random() * 2 - 1) * this.config.screenShake.maxShake * shakeFactor;
        const shakeY = (Math.random() * 2 - 1) * this.config.screenShake.maxShake * shakeFactor;
        const shakeZ = (Math.random() * 2 - 1) * this.config.screenShake.maxShake * shakeFactor;
        this.cameraParent.position.set(shakeX, shakeY, shakeZ);
      } else {
        this.renderer.setClearColor(this.config.clearColor);
        this.cameraParent.position.set(0, 0, 0);
      }
    };

    if (this.gameObjects == null) {
      throw Error("Cannot render before render has been initialized.");
    }

    if (game.timeUntilServeSec > 0) {
      const timePassed = game.config.pauseAfterScoreSec - game.timeUntilServeSec;
      const serveProgress = timePassed / game.config.pauseAfterScoreSec;
      this.scoreboard.setServeProgress(serveProgress);
    }

    updateBall(this.gameObjects.ball);

    updatePaddleObj(this.gameObjects.player1Paddle, game.player1Paddle);
    updatePaddleObj(this.gameObjects.player2Paddle, game.player2Paddle);

    updateScreenShake();
  }

}
