import { UniversalCamera, Mesh, Scene, StandardMaterial, Texture, Vector3, MeshBuilder, Matrix, Quaternion, Color3, Color4, CubeTexture, SceneLoader, Sound, ShadowGenerator, DirectionalLight, AnimationPropertiesOverride, HemisphericLight, PointLight, GlowLayer, PBRMetallicRoughnessMaterial, AnimationGroup, TransformNode, ExecuteCodeAction, ActionManager } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import { Player } from "@/utils/player";
import { PlayerInput } from "@/utils/inputController";
import { Hud } from "@/utils/ui";
import { Lantern } from "./lantern"

class Room1 {
    private _scene: Scene;
    private _canvas: any;
    //private _camera: UniversalCamera;

    private _input: PlayerInput;
    private _player: Player;
    public assets: any;
    public game: any;

    //Meshes
    private _lanternObjs: Array<Lantern>; 
    private _lightmtl: PBRMetallicRoughnessMaterial;

    // UI
    private _ui: Hud;

    constructor(scene: Scene, canvas: any) {
        this._scene = scene;
        this._canvas = canvas;
        this._ui = new Hud(scene);
        //scene.debugLayer.show();
    }

    public async load() {
        // set Camera
        const camera: UniversalCamera = new UniversalCamera("Camera", new Vector3(-5, 1, -5), this._scene);
        camera.attachControl(this._canvas, true);
        camera.rotation.y = Math.PI / 4
        const light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), this._scene);
        // var light2 = new DirectionalLight("dir01", new Vector3(0, -0.5, -1.0), this._scene);
        // light2.position = new Vector3(0, 5, 5);
        //this._scene.detachControl();

        this._lanternObjs = [];

        //create emissive material for lantern
        const lightmtl = new PBRMetallicRoughnessMaterial("lantern mesh light", this._scene);
        lightmtl.emissiveTexture = new Texture("/textures/litLantern.png", this._scene, true, false);
        lightmtl.emissiveColor = new Color3(0.8784313725490196, 0.7568627450980392, 0.6235294117647059);
        this._lightmtl = lightmtl;
        
        await this._loadGround() // ground
        await this._loadCharacterAssets(this._scene); //character
        const assetsLantern = await this._loadAsset();

        //--LANTERNS--
        assetsLantern.lantern.isVisible = false; //original mesh is not visible
        //transform node to hold all lanterns
        const lanternHolder = new TransformNode("lanternHolder", this._scene);
        for (let i = 0; i < 22; i++) {
            //Mesh Cloning
            let lanternInstance = assetsLantern.lantern.clone("lantern" + i); //bring in imported lantern mesh & make clones
            lanternInstance.isVisible = true;
            lanternInstance.setParent(lanternHolder);

            //Animation cloning
            let animGroupClone = new AnimationGroup("lanternAnimGroup " + i);
            animGroupClone.addTargetedAnimation(assetsLantern.animationGroups.targetedAnimations[0].animation, lanternInstance);

            //Create the new lantern object
            let newLantern = new Lantern(this._lightmtl, lanternInstance, this._scene, new Vector3(Math.random()*50, 0.3, Math.random()*50), animGroupClone);
            this._lanternObjs.push(newLantern);
        }
        //dispose of original mesh and animation group that were cloned
        assetsLantern.lantern.dispose();
        assetsLantern.animationGroups.dispose();

        //--INPUT--
        this._input = new PlayerInput(this._scene);
        await this._initializeGameAsync(this._scene)
        //--GUI--
        this._ui.startTimer();
    }

    public async _loadGround() {
        const groundMat = new StandardMaterial("groundMat", this._scene);
        groundMat.diffuseTexture = new Texture("https://playground.babylonjs.com/textures/grass.jpg", this._scene);
        groundMat.diffuseTexture.uScale = 10;
        groundMat.diffuseTexture.vScale = 10;

        var ground = Mesh.CreateBox("ground", 1, this._scene);
        ground.material = groundMat;
        ground.scaling = new Vector3(100.0, 0.01, 100.0);
        ground.position = new Vector3(0, -2, 0);
    }

    //load the character model
    private async _loadCharacterAssets(scene): Promise<any> {

        async function loadCharacter() {
            //collision mesh
            const outer = MeshBuilder.CreateBox("outer", { width: 2, depth: 1, height: 3 }, scene);
            outer.isVisible = false;
            outer.isPickable = false;
            outer.checkCollisions = true;

            //move origin of box collider to the bottom of the mesh (to match player mesh)
            outer.bakeTransformIntoVertices(Matrix.Translation(0, 1.5, 0))
            //for collisions
            outer.ellipsoid = new Vector3(1, 1.5, 1);
            outer.ellipsoidOffset = new Vector3(0, 1.5, 0);

            outer.rotationQuaternion = new Quaternion(0, 1, 0, 0); // rotate the player mesh 180 since we want to see the back of the player

            //--IMPORTING MESH--
            return SceneLoader.ImportMeshAsync(null, "/models/", "player.glb", scene).then((result) => {
                const root = result.meshes[0];
                //body is our actual player mesh
                const body = root;
                body.parent = outer;
                body.isPickable = false;
                body.getChildMeshes().forEach(m => {
                    m.isPickable = false;
                })

                //return the mesh and animations
                return {
                    mesh: outer as Mesh,
                    animationGroups: result.animationGroups
                }
            });
        }

        return loadCharacter().then(assets => {
            this.assets = assets;
        });
    }

    public async _loadAsset() {

        //loads lantern mesh
        const res = await SceneLoader.ImportMeshAsync("lantern", "/models/", "lantern.glb", this._scene);

        //extract the actual lantern mesh from the root of the mesh that's imported, dispose of the root
        let lantern = res.meshes[0].getChildren()[0];
        lantern.parent = null;
        res.meshes[0].dispose();

        // //--ANIMATION--
        // //extract animation from lantern (following demystifying animation groups video)
        const importedAnims = res.animationGroups;
        let animation = [];
        animation.push(importedAnims[0].targetedAnimations[0].animation);
        importedAnims[0].dispose();
        //create a new animation group and target the mesh to its animation
        let animGroup = new AnimationGroup("lanternAnimGroup");
        animGroup.addTargetedAnimation(animation[0], res.meshes[1]);

        return {
            lantern: lantern as Mesh,
            animationGroups: animGroup
        }
    }


    public checkLanterns(player: Player) {
        if (!this._lanternObjs[0].isLit) {
            this._lanternObjs[0].setEmissiveTexture();
        }
        this._lanternObjs.forEach(lantern => {
            player.mesh.actionManager.registerAction(
                new ExecuteCodeAction(
                    {
                        trigger: ActionManager.OnIntersectionEnterTrigger,
                        parameter: lantern.mesh
                    },
                    () => {
                        //if the lantern is not lit, light it up & reset sparkler timer
                        if (!lantern.isLit && player.sparkLit) {
                            player.lanternsLit += 1;
                            lantern.setEmissiveTexture();
                            player.sparkReset = true;
                            player.sparkLit = true;

                            //SFX
                            player.lightSfx.play();
                        }
                        //if the lantern is lit already, reset the sparkler timer
                        else if (lantern.isLit) {
                            player.sparkReset = true;
                            player.sparkLit = true;

                            //SFX
                            player.sparkResetSfx.play();
                        }
                    }
                )
            );
        });
    }

    //init game
    private async _initializeGameAsync(scene: Scene): Promise<void> {

        scene.ambientColor = new Color3(0.34509803921568627, 0.5568627450980392, 0.8352941176470589);
        scene.clearColor = new Color4(0.01568627450980392, 0.01568627450980392, 0.20392156862745098);

        const light = new PointLight("sparklight", new Vector3(0, 0, 0), scene);
        light.diffuse = new Color3(0.08627450980392157, 0.10980392156862745, 0.15294117647058825);
        light.intensity = 35;
        light.radius = 1;

        const shadowGenerator = new ShadowGenerator(1024, light);
        shadowGenerator.darkness = 0.4;

        //Create the player
        this._player = new Player(this.assets, scene, shadowGenerator, this._input);

        const camera = this._player.activatePlayerCamera();

        //set up lantern collision checks
        //this._environment.checkLanterns(this._player);
        this.checkLanterns(this._player);
        //--Transition post process--
        scene.registerBeforeRender(() => {
            if (this._ui.transition) {
                this._ui.fadeLevel -= .05;

                //once the fade transition has complete, switch scenes
                if (this._ui.fadeLevel <= 0) {
                    this._ui.quit = true;
                    this._ui.transition = false;
                }
            }
        })

        //--GAME LOOP--
        scene.onBeforeRenderObservable.add(() => {
            if (this._player.sparkReset) {
                this._ui.updateLanternCount(this._player.lanternsLit);
            }
            console.log(`this._player.win`, this._player.win)
            //if you've reached the destination and lit all the lanterns
            if (this._player.win && this._player.lanternsLit > 10) {
                this._ui.gamePaused = true; //stop the timer so that fireworks can play and player cant move around
                //dont allow pause menu interaction
                this._ui.pauseBtn.isHitTestVisible = false;

                let i = 10; //10 seconds
                window.setInterval(() => {
                    i--;
                    if (i == 0) {
                        this._showWin();
                    }
                }, 1000);
                this._player.win = false;
            }
            this._ui.updateHud();
        })

        //glow layer
        const gl = new GlowLayer("glow", scene);
        gl.intensity = 0.4;
        // this._environment._lanternObjs.forEach(lantern => {
        //     gl.addIncludedOnlyMesh(lantern.mesh);
        // });
        //webpack served from public       
    }

    private _showWin(): void {
        console.log(`-----------WinWin----------------`)
    }
}

export default Room1