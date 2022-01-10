import { ActionManager, AnimationPropertiesOverride, ArcRotateCamera, Color3, DirectionalLight, ExecuteCodeAction, HemisphericLight, Mesh, Scalar, Scene, SceneLoader, ShadowGenerator, Skeleton, StandardMaterial, Texture, Vector3 } from "@babylonjs/core";
import { Button, StackPanel, AdvancedDynamicTexture, Control } from '@babylonjs/gui'
class Room2 {
    private _scene: Scene;
    private _canvas: any;

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
    }

    public async load() {
        //this._loadGround()
        this._loadSnece(this._scene, this._canvas)
    }

    public async _loadGround(){
        const groundMat = new StandardMaterial("groundMat", this._scene);
        groundMat.diffuseColor = new Color3(0, 1, 0)

        var ground = Mesh.CreateBox("ground", 1, this._scene);
        ground.material = groundMat;
        ground.scaling = new Vector3(100.0, 0.01, 100.0);
        ground.position = new Vector3(0, 0.02, 0);
    }

    public async _loadSnece(scene, canvas){
        var camera = new ArcRotateCamera("camera1", Math.PI / 2, Math.PI / 4, 3, new Vector3(0, 1, 0), scene);
        camera.attachControl(canvas, true);

        camera.lowerRadiusLimit = 2;
        camera.upperRadiusLimit = 10;
        camera.wheelDeltaPercentage = 0.01;

        //this._scene.detachControl();

        var light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);
        light.intensity = 0.6;
        light.specular = Color3.Black();

        var light2 = new DirectionalLight("dir01", new Vector3(0, -0.5, -1.0), scene);
        light2.position = new Vector3(0, 5, 5);

        // Shadows
        var shadowGenerator = new ShadowGenerator(1024, light2);
        shadowGenerator.useBlurExponentialShadowMap = true;
        shadowGenerator.blurKernel = 32;

        SceneLoader.ImportMesh("", "https://playground.babylonjs.com/scenes/", "dummy3.babylon", scene, function (newMeshes, particleSystems, skeletons) {
            var skeleton = skeletons[0];
            console.log("skeleton", skeleton)
            shadowGenerator.addShadowCaster(scene.meshes[0], true);
            for (var index = 0; index < newMeshes.length; index++) {
                newMeshes[index].receiveShadows = false;;
            }

            var helper = scene.createDefaultEnvironment({
                enableGroundShadow: true
            });
            helper.setMainColor(Color3.Gray());
            helper.ground.position.y += 0.01;
            
            // ROBOT
            skeleton.animationPropertiesOverride = new AnimationPropertiesOverride();
            skeleton.animationPropertiesOverride.enableBlending = true;
            skeleton.animationPropertiesOverride.blendingSpeed = 0.05;
            skeleton.animationPropertiesOverride.loopMode = 1;
            var idleRange = skeleton.getAnimationRange("YBot_Idle");
            var walkRange = skeleton.getAnimationRange("YBot_Walk");
            var runRange = skeleton.getAnimationRange("YBot_Run");
            var leftRange = skeleton.getAnimationRange("YBot_LeftStrafeWalk");
            var rightRange = skeleton.getAnimationRange("YBot_RightStrafeWalk");

            //UI Control
            let ui = new RoomUI(scene)
            ui.walkBtn.onPointerDownObservable.add(()=> {
                if (walkRange) scene.beginAnimation(skeleton, walkRange.from, walkRange.to, true);
            });
            ui.idleBtn.onPointerDownObservable.add(()=> {
                if (idleRange) scene.beginAnimation(skeleton, idleRange.from, idleRange.to, true);
            });
            ui.walkBtn.onPointerDownObservable.add(()=> {
                if (walkRange) scene.beginAnimation(skeleton, walkRange.from, walkRange.to, true);
            });
            ui.runBtn.onPointerDownObservable.add(()=> {
                if (runRange) scene.beginAnimation(skeleton, runRange.from, runRange.to, true);
            });
            ui.leftBtn.onPointerDownObservable.add(()=> {
                if (leftRange) scene.beginAnimation(skeleton, leftRange.from, leftRange.to, true);
            });
            ui.rightBtn.onPointerDownObservable.add(()=> {
                if (rightRange) scene.beginAnimation(skeleton, rightRange.from, rightRange.to, true);
            });
            ui.blendBtn.onPointerDownObservable.add(()=> {
                if (walkRange && leftRange) {
                    scene.stopAnimation(skeleton);
                    var walkAnim = scene.beginWeightedAnimation(skeleton, walkRange.from, walkRange.to, 0.5, true);
                    var leftAnim = scene.beginWeightedAnimation(skeleton, leftRange.from, leftRange.to, 0.5, true);
    
                    // Note: Sync Speed Ratio With Master Walk Animation
                    walkAnim.syncWith(null);
                    leftAnim.syncWith(walkAnim);
                }
            });
            // IDLE
            if (idleRange) scene.beginAnimation(skeleton, idleRange.from, idleRange.to, true);
            
        });	

        //scene action manager to detect inputs
        this._scene.actionManager = new ActionManager(this._scene);

        this.inputMap = {};
        this._scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (evt) => {
            this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }));
        this._scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (evt) => {
            this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }));

        //add to the scene an observable that calls updateFromKeyboard before rendering
        scene.onBeforeRenderObservable.add(() => {
            this._updateFromKeyboard();
        });
        
    }

    private _updateFromKeyboard(): void {
        console.log("ArrowUp", this.inputMap)
        //forward - backwards movement
        if (this.inputMap["ArrowUp"]) {
            this.verticalAxis = 1;
            this.vertical = Scalar.Lerp(this.vertical, 1, 0.2);
        } else if (this.inputMap["ArrowDown"]) {
            this.vertical = Scalar.Lerp(this.vertical, -1, 0.2);
            this.verticalAxis = -1;
        } else {
            this.vertical = 0;
            this.verticalAxis = 0;
        }

        //left - right movement
        if (this.inputMap["ArrowLeft"]) {
            //lerp will create a scalar linearly interpolated amt between start and end scalar
            //taking current horizontal and how long you hold, will go up to -1(all the way left)
            this.horizontal = Scalar.Lerp(this.horizontal, -1, 0.2);
            this.horizontalAxis = -1;

        } else if (this.inputMap["ArrowRight"]) {
            this.horizontal = Scalar.Lerp(this.horizontal, 1, 0.2);
            this.horizontalAxis = 1;
        }
        else {
            this.horizontal = 0;
            this.horizontalAxis = 0;
        }

        //dash
        if (this.inputMap["Shift"]) {
            this.dashing = true;
        } else {
            this.dashing = false;
        }

        //Jump Checks (SPACE)
        if (this.inputMap[" "]) {
            this.jumpKeyDown = true;
        } else {
            this.jumpKeyDown = false;
        }
    }
}

class RoomUI{
    private _scene;
    private buttonUI;
    private uiPanel;

    //Buttons
    public idleBtn: Button;
    public walkBtn: Button;
    public runBtn: Button;
    public leftBtn: Button;
    public rightBtn: Button;
    public blendBtn: Button;

    constructor(scene: Scene){
        this._scene = scene;
        // UI
        const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        this.buttonUI = advancedTexture

        let UiPanel = new StackPanel();
        UiPanel.width = "220px";
        UiPanel.fontSize = "14px";
        UiPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        UiPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this.uiPanel = UiPanel
        advancedTexture.addControl(UiPanel);

        // ..
        var button = Button.CreateSimpleButton("but", "Play Idle");
        button.paddingTop = "10px";
        button.width = "100px";
        button.height = "50px";
        button.color = "white";
        button.background = "green";
        this.idleBtn = button
        UiPanel.addControl(button);
        

        // ..
        var button1 = Button.CreateSimpleButton("but1", "Play Walk");
        button1.paddingTop = "10px";
        button1.width = "100px";
        button1.height = "50px";
        button1.color = "white";
        button1.background = "green";
        this.walkBtn = button1
        UiPanel.addControl(button1);
        

        // ..
        var button2 = Button.CreateSimpleButton("but2", "Play Run");
        this.runBtn = button2
        button2.paddingTop = "10px";
        button2.width = "100px";
        button2.height = "50px";
        button2.color = "white";
        button2.background = "green";
        UiPanel.addControl(button2);
        

        // ..
        var button3 = Button.CreateSimpleButton("but3", "Play Left");
        button3.paddingTop = "10px";
        button3.width = "100px";
        button3.height = "50px";
        button3.color = "white";
        button3.background = "green";
        this.leftBtn = button3
        UiPanel.addControl(button3);
        

        // ..
        var button4 = Button.CreateSimpleButton("but4", "Play Right");
        button4.paddingTop = "10px";
        button4.width = "100px";
        button4.height = "50px";
        button4.color = "white";
        button4.background = "green";
        this.rightBtn = button4
        UiPanel.addControl(button4);
        

        // ..
        var button5 = Button.CreateSimpleButton("but5", "Play Blend");
        button5.paddingTop = "10px";
        button5.width = "100px";
        button5.height = "50px";
        button5.color = "white";
        button5.background = "green";
        this.blendBtn = button5
        UiPanel.addControl(button5);
        
    }

    
}

export default Room2