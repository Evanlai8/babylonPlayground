import {
  ActionManager,
  AnimationPropertiesOverride,
  ArcRotateCamera,
  Color3,
  DirectionalLight,
  ExecuteCodeAction,
  HemisphericLight,
  Mesh,
  Scalar,
  Scene,
  SceneLoader,
  ShadowGenerator,
  Skeleton,
  StandardMaterial,
  Texture,
  Vector3,
} from "@babylonjs/core";
import {
  Button,
  StackPanel,
  AdvancedDynamicTexture,
  Control,
} from "@babylonjs/gui";
import RoomUI from "./ui";
import { PlayerInput } from "@/pages/room/Room1/inputController";
import { Camera } from "@/pages/common/camera";

class Room2 {
  private _scene: Scene;
  private _canvas: any;

  private _input: PlayerInput;
  public inputMap: any;
  //simple movement
  public horizontal: number = 0;
  public vertical: number = 0;
  //tracks whether or not there is movement in that axis
  public horizontalAxis: number = 0;
  public verticalAxis: number = 0;

  //jumping and dashing
  public jumpKeyDown: boolean = false;
  public dashing: boolean = false;

  constructor(scene: Scene, canvas: any) {
    this._scene = scene;
    this._canvas = canvas;
    this._input = new PlayerInput(this._scene);
  }

  public async load() {
    //this._loadGround()
    this._loadSnece(this._scene, this._canvas);
  }

  public async _loadGround() {
    const groundMat = new StandardMaterial("groundMat", this._scene);
    groundMat.diffuseTexture = new Texture(
      "https://playground.babylonjs.com/textures/wood.jpg",
      this._scene
    );
    //groundMat.diffuseColor = new Color3(0, 1, 0)

    var ground = Mesh.CreateBox("ground", 1, this._scene);
    ground.material = groundMat;
    ground.scaling = new Vector3(100.0, 0.01, 100.0);
    ground.position = new Vector3(0, 0.02, 0);
  }

  public async _loadSnece(scene, canvas) {
    // arc camera
    const camera = new Camera(scene, canvas);
    camera.setupArcCamera();

    //this._scene.detachControl();

    var light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);
    light.intensity = 0.6;
    light.specular = Color3.Black();

    var light2 = new DirectionalLight(
      "dir01",
      new Vector3(0, -0.5, -1.0),
      scene
    );
    light2.position = new Vector3(0, 5, 5);

    // Shadows
    var shadowGenerator = new ShadowGenerator(1024, light2);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurKernel = 32;

    SceneLoader.ImportMesh(
      "",
      "https://playground.babylonjs.com/scenes/",
      "dummy3.babylon",
      scene,
      function (newMeshes, particleSystems, skeletons) {
        var skeleton = skeletons[0];
        console.log("skeleton", skeleton);
        shadowGenerator.addShadowCaster(scene.meshes[0], true);
        for (var index = 0; index < newMeshes.length; index++) {
          newMeshes[index].receiveShadows = false;
        }

        var helper = scene.createDefaultEnvironment({
          enableGroundShadow: true,
        });
        helper.setMainColor(Color3.Gray());
        helper.ground.position.y += 0.01;

        // ROBOT
        skeleton.animationPropertiesOverride =
          new AnimationPropertiesOverride();
        skeleton.animationPropertiesOverride.enableBlending = true;
        skeleton.animationPropertiesOverride.blendingSpeed = 0.05;
        skeleton.animationPropertiesOverride.loopMode = 1;
        var idleRange = skeleton.getAnimationRange("YBot_Idle");
        var walkRange = skeleton.getAnimationRange("YBot_Walk");
        var runRange = skeleton.getAnimationRange("YBot_Run");
        var leftRange = skeleton.getAnimationRange("YBot_LeftStrafeWalk");
        var rightRange = skeleton.getAnimationRange("YBot_RightStrafeWalk");

        //UI Control
        let ui = new RoomUI(scene);
        ui.walkBtn.onPointerDownObservable.add(() => {
          if (walkRange)
            scene.beginAnimation(skeleton, walkRange.from, walkRange.to, true);
        });
        ui.idleBtn.onPointerDownObservable.add(() => {
          if (idleRange)
            scene.beginAnimation(skeleton, idleRange.from, idleRange.to, true);
        });
        ui.walkBtn.onPointerDownObservable.add(() => {
          if (walkRange)
            scene.beginAnimation(skeleton, walkRange.from, walkRange.to, true);
        });
        ui.runBtn.onPointerDownObservable.add(() => {
          if (runRange)
            scene.beginAnimation(skeleton, runRange.from, runRange.to, true);
        });
        ui.leftBtn.onPointerDownObservable.add(() => {
          if (leftRange)
            scene.beginAnimation(skeleton, leftRange.from, leftRange.to, true);
        });
        ui.rightBtn.onPointerDownObservable.add(() => {
          if (rightRange)
            scene.beginAnimation(
              skeleton,
              rightRange.from,
              rightRange.to,
              true
            );
        });
        ui.blendBtn.onPointerDownObservable.add(() => {
          if (walkRange && leftRange) {
            scene.stopAnimation(skeleton);
            var walkAnim = scene.beginWeightedAnimation(
              skeleton,
              walkRange.from,
              walkRange.to,
              0.5,
              true
            );
            var leftAnim = scene.beginWeightedAnimation(
              skeleton,
              leftRange.from,
              leftRange.to,
              0.5,
              true
            );

            // Note: Sync Speed Ratio With Master Walk Animation
            walkAnim.syncWith(null);
            leftAnim.syncWith(walkAnim);
          }
        });
        // IDLE
        if (idleRange)
          scene.beginAnimation(skeleton, idleRange.from, idleRange.to, true);
      }
    );

    //scene action manager to detect inputs
    this._scene.actionManager = new ActionManager(this._scene);

    console.log("this._input", this._input);

    //add to the scene an observable that calls updateFromKeyboard before rendering
    scene.onBeforeRenderObservable.add(() => {});
  }
}

export default Room2;
