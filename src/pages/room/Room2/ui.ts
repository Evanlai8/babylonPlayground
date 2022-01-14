import { Scene } from "@babylonjs/core";
import {
  Button,
  StackPanel,
  AdvancedDynamicTexture,
  Control,
} from "@babylonjs/gui";

export default class RoomUI {
  private _scene;

  // action panel
  private actionPanel;

  //action Buttons
  public idleBtn: Button;
  public walkBtn: Button;
  public runBtn: Button;
  public leftBtn: Button;
  public rightBtn: Button;
  public blendBtn: Button;

  // camera panel
  private cameraPanel;

  // camera Buttons
  public PlayerCameraBtn: Button;
  public ArcCameraBtn: Button;
  public FirstCameraBtn: Button;

  constructor(scene: Scene) {
    this._scene = scene;
    //Screen UI
    const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");

    //action UI
    let actionPanel = new StackPanel();
    actionPanel.width = "220px";
    actionPanel.fontSize = "14px";
    actionPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    actionPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    this.actionPanel = actionPanel;
    advancedTexture.addControl(actionPanel);

    // action Buttons..
    var button = Button.CreateSimpleButton("but", "Play Idle");
    button.paddingTop = "10px";
    button.width = "100px";
    button.height = "50px";
    button.color = "white";
    button.background = "green";
    this.idleBtn = button;
    actionPanel.addControl(button);

    // ..
    var button1 = Button.CreateSimpleButton("but1", "Play Walk");
    button1.paddingTop = "10px";
    button1.width = "100px";
    button1.height = "50px";
    button1.color = "white";
    button1.background = "green";
    this.walkBtn = button1;
    actionPanel.addControl(button1);

    // ..
    var button2 = Button.CreateSimpleButton("but2", "Play Run");
    this.runBtn = button2;
    button2.paddingTop = "10px";
    button2.width = "100px";
    button2.height = "50px";
    button2.color = "white";
    button2.background = "green";
    actionPanel.addControl(button2);

    // ..
    var button3 = Button.CreateSimpleButton("but3", "Play Left");
    button3.paddingTop = "10px";
    button3.width = "100px";
    button3.height = "50px";
    button3.color = "white";
    button3.background = "green";
    this.leftBtn = button3;
    actionPanel.addControl(button3);

    // ..
    var button4 = Button.CreateSimpleButton("but4", "Play Right");
    button4.paddingTop = "10px";
    button4.width = "100px";
    button4.height = "50px";
    button4.color = "white";
    button4.background = "green";
    this.rightBtn = button4;
    actionPanel.addControl(button4);

    // ..
    var button5 = Button.CreateSimpleButton("but5", "Play Blend");
    button5.paddingTop = "10px";
    button5.width = "100px";
    button5.height = "50px";
    button5.color = "white";
    button5.background = "green";
    this.blendBtn = button5;
    actionPanel.addControl(button5);

    // camera UI
    let cameraPanel = new StackPanel();
    cameraPanel.width = "220px";
    cameraPanel.fontSize = "14px";
    cameraPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    cameraPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    this.cameraPanel = cameraPanel;
    advancedTexture.addControl(cameraPanel);

    // camera Buttons
    const button6 = Button.CreateSimpleButton("but6", "Player Camera");
    button6.paddingTop = "10px";
    button6.width = "100px";
    button6.height = "50px";
    button6.color = "white";
    button6.background = "green";
    this.PlayerCameraBtn = button6;
    cameraPanel.addControl(button6);

    const button7 = Button.CreateSimpleButton("but7", "Arc Camera");
    button7.paddingTop = "10px";
    button7.width = "100px";
    button7.height = "50px";
    button7.color = "white";
    button7.background = "green";
    this.ArcCameraBtn = button7;
    cameraPanel.addControl(button7);

    const button8 = Button.CreateSimpleButton("but5", "FirstPerson Camera");
    button8.paddingTop = "10px";
    button8.width = "100px";
    button8.height = "50px";
    button8.color = "white";
    button8.background = "green";
    this.FirstCameraBtn = button8;
    cameraPanel.addControl(button8);
  }
}
