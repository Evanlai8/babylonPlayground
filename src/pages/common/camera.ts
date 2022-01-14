import {
  Scene,
  Vector3,
  TransformNode,
  ArcRotateCamera,
  UniversalCamera,
  ShadowGenerator,
} from "@babylonjs/core";

export class Camera {
  private _scene: Scene;
  private _canvas: any;
  private _camRoot: TransformNode;
  private _yTilt: TransformNode;

  private _updateCamera: void;

  constructor(scene: Scene, canvas: any) {
    this._scene = scene;
    this._canvas = canvas;
  }

  private _loadCamera(scene: Scene): void {
    console.log("_loadCamera");
    this.setupArcCamera();
  }

  public setupArcCamera(): ArcRotateCamera {
    var camera = new ArcRotateCamera(
      "camera1",
      Math.PI / 2,
      Math.PI / 4,
      3,
      new Vector3(0, 1, 0),
      this._scene
    );
    camera.attachControl(this._canvas, true);
    // camera.lowerRadiusLimit = 2;
    // camera.upperRadiusLimit = 10;
    // camera.wheelDeltaPercentage = 0.01;

    return camera;
  }

  public setupPlayerCamera(): UniversalCamera {
    //root camera parent that handles positioning of the camera to follow the player
    this._camRoot = new TransformNode("root");
    this._camRoot.position = new Vector3(0, 0, 0); //initialized at (0,0,0)
    //to face the player from behind (180 degrees)
    this._camRoot.rotation = new Vector3(0, Math.PI, 0);

    //rotations along the x-axis (up/down tilting)
    let yTilt = new TransformNode("ytilt");
    //adjustments to camera view to point down at our player
    yTilt.rotation = Player.ORIGINAL_TILT;
    this._yTilt = yTilt;
    yTilt.parent = this._camRoot;

    //our actual camera that's pointing at our root's position
    this.camera = new UniversalCamera(
      "cam",
      new Vector3(0, 0, -30),
      this.scene
    );
    this.camera.lockedTarget = this._camRoot.position;
    this.camera.fov = 0.47350045992678597;
    this.camera.parent = yTilt;

    this.scene.activeCamera = this.camera;
    return this.camera;
  }
}
