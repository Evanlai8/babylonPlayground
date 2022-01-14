import {
  TextBlock,
  StackPanel,
  AdvancedDynamicTexture,
  Image,
  Button,
  Rectangle,
  Control,
  Grid,
} from "@babylonjs/gui";
import {
  Scene,
  Sound,
  ParticleSystem,
  PostProcess,
  Effect,
  SceneSerializer,
} from "@babylonjs/core";

export class Hud {
  private _scene: Scene;

  //Game Timer
  public time: number; //keep track to signal end game REAL TIME
  private _prevTime: number = 0;
  private _clockTime: TextBlock = null; //GAME TIME
  private _startTime: number;
  private _stopTimer: boolean;
  private _sString = "00";
  private _mString = 11;
  private _lanternCnt: TextBlock;

  //Animated UI sprites
  private _sparklerLife: Image;
  private _spark: Image;

  //Timer handlers
  public stopSpark: boolean;
  private _handle;
  private _sparkhandle;

  //Pause toggle
  public gamePaused: boolean;

  //Quit game
  public quit: boolean;
  public transition: boolean = false;

  //UI Elements
  public pauseBtn: Button;
  public fadeLevel: number;
  private _playerUI;
  private _pauseMenu;
  private _controls;
  public tutorial;
  public hint;

  //Mobile
  public isMobile: boolean;
  public jumpBtn: Button;
  public dashBtn: Button;
  public leftBtn: Button;
  public rightBtn: Button;
  public upBtn: Button;
  public downBtn: Button;

  //Sounds
  public quitSfx: Sound;
  private _sfx: Sound;
  private _pause: Sound;
  private _sparkWarningSfx: Sound;

  constructor(scene: Scene) {
    this._scene = scene;

    const playerUI = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    this._playerUI = playerUI;
    this._playerUI.idealHeight = 720;

    const lanternCnt = new TextBlock();
    lanternCnt.name = "lantern count";
    lanternCnt.textVerticalAlignment = TextBlock.VERTICAL_ALIGNMENT_CENTER;
    lanternCnt.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    lanternCnt.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    lanternCnt.fontSize = "22px";
    lanternCnt.color = "white";
    lanternCnt.text = "Lanterns: 1 / 22";
    lanternCnt.top = "32px";
    lanternCnt.left = "-64px";
    lanternCnt.width = "25%";
    lanternCnt.fontFamily = "Viga";
    lanternCnt.resizeToFit = true;
    playerUI.addControl(lanternCnt);
    this._lanternCnt = lanternCnt;

    const stackPanel = new StackPanel();
    stackPanel.height = "100%";
    stackPanel.width = "100%";
    stackPanel.top = "14px";
    stackPanel.verticalAlignment = 0;
    playerUI.addControl(stackPanel);

    //Game timer text
    const clockTime = new TextBlock();
    clockTime.name = "clock";
    clockTime.textHorizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_CENTER;
    clockTime.fontSize = "48px";
    clockTime.color = "white";
    clockTime.text = "11:00";
    clockTime.resizeToFit = true;
    clockTime.height = "96px";
    clockTime.width = "220px";
    clockTime.fontFamily = "Viga";
    stackPanel.addControl(clockTime);
    this._clockTime = clockTime;

    const hint = new Rectangle();
    hint.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    hint.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    hint.top = "14%";
    hint.left = "-4%";
    hint.height = 0.08;
    hint.width = 0.08;
    hint.thickness = 0;
    hint.alpha = 0.6;
    hint.isVisible = false;
    this._playerUI.addControl(hint);
    this.hint = hint;
    //hint to the first lantern, will disappear once you light it
    const lanternHint = new Image("lantern1", "/sprites/arrowBtn.png");
    lanternHint.rotation = Math.PI / 2;
    lanternHint.stretch = Image.STRETCH_UNIFORM;
    lanternHint.height = 0.8;
    lanternHint.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    hint.addControl(lanternHint);
    const moveHint = new TextBlock("move", "Move Right");
    moveHint.color = "white";
    moveHint.fontSize = "12px";
    moveHint.fontFamily = "Viga";
    moveHint.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    moveHint.textWrapping = true;
    moveHint.resizeToFit = true;
    hint.addControl(moveHint);
    this._createControlsMenu();
    this._loadSounds(scene);
  }

  public updateHud(): void {
    if (!this._stopTimer && this._startTime != null) {
      let curTime =
        Math.floor((new Date().getTime() - this._startTime) / 1000) +
        this._prevTime; // divide by 1000 to get seconds

      this.time = curTime; //keeps track of the total time elapsed in seconds
      this._clockTime.text = this._formatTime(curTime);
    }
  }

  public updateLanternCount(numLanterns: number): void {
    this._lanternCnt.text = "Lanterns: " + numLanterns + " / 22";
  }
  //---- Game Timer ----
  public startTimer(): void {
    this._startTime = new Date().getTime();
    this._stopTimer = false;
  }
  public stopTimer(): void {
    this._stopTimer = true;
  }

  //format the time so that it is relative to 11:00 -- game time
  private _formatTime(time: number): string {
    let minsPassed = Math.floor(time / 60); //seconds in a min
    let secPassed = time % 240; // goes back to 0 after 4mins/240sec
    //gameclock works like: 4 mins = 1 hr
    // 4sec = 1/15 = 1min game time
    if (secPassed % 4 == 0) {
      this._mString = Math.floor(minsPassed / 4) + 11;
      this._sString = (secPassed / 4 < 10 ? "0" : "") + secPassed / 4;
    }
    let day = this._mString == 11 ? " PM" : " AM";
    return this._mString + ":" + this._sString + day;
  }

  //---- Controls Menu Popup ----
  private _createControlsMenu(): void {
    const controls = new Rectangle();
    controls.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    controls.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    controls.height = 0.8;
    controls.width = 0.5;
    controls.thickness = 0;
    controls.color = "white";
    controls.isVisible = false;
    this._playerUI.addControl(controls);
    this._controls = controls;

    //background image
    const image = new Image("controls", "/sprites/controls.jpeg");
    controls.addControl(image);

    const title = new TextBlock("title", "CONTROLS");
    title.resizeToFit = true;
    title.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    title.fontFamily = "Viga";
    title.fontSize = "32px";
    title.top = "14px";
    controls.addControl(title);

    const backBtn = Button.CreateImageOnlyButton(
      "back",
      "/sprites/lanternbutton.jpeg"
    );
    backBtn.width = "40px";
    backBtn.height = "40px";
    backBtn.top = "14px";
    backBtn.thickness = 0;
    backBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    backBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    controls.addControl(backBtn);

    //when the button is down, make menu invisable and remove control of the menu
    backBtn.onPointerDownObservable.add(() => {
      this._pauseMenu.isVisible = true;
      this._controls.isVisible = false;

      //play transition sound
      this._sfx.play();
    });
  }

  //load all sounds needed for game ui interactions
  private _loadSounds(scene: Scene): void {
    this._pause = new Sound(
      "pauseSong",
      "/sounds/Snowland.wav",
      scene,
      function () {},
      {
        volume: 0.2,
      }
    );

    this._sfx = new Sound(
      "selection",
      "/sounds/vgmenuselect.wav",
      scene,
      function () {}
    );

    this.quitSfx = new Sound(
      "quit",
      "/sounds/Retro Event UI 13.wav",
      scene,
      function () {}
    );

    this._sparkWarningSfx = new Sound(
      "sparkWarning",
      "/sounds/Retro Water Drop 01.wav",
      scene,
      function () {},
      {
        loop: true,
        volume: 0.5,
        playbackRate: 0.6,
      }
    );
  }
}
