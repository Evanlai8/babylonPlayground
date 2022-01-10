import { ArcRotateCamera, Engine, HemisphericLight, Mesh, MeshBuilder, Scene, StandardMaterial, Texture, UniversalCamera, Vector3 } from '@babylonjs/core';
import { useEffect, useState } from 'react';
import { Space, Button } from "antd"
import Environment from '../layouts/environment'
import styles from './index.less';

export default function IndexPage() {
  const [room, setRoom] = useState(1)

  const _loadEnvironment = async() => {
    // create canvas
    document.documentElement.style["overflow"] = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.width = "100%";
    document.documentElement.style.height = "100%";
    document.documentElement.style.margin = "0";
    document.documentElement.style.padding = "0";
    document.body.style.overflow = "hidden";
    document.body.style.width = "100%";
    document.body.style.height = "100%";
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    const canvas = document.createElement("canvas")
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.overflowY = "hidden";
    canvas.id = "gameCanvas";
    document.body.appendChild(canvas);

    // initialize
    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);

    // load Environment


    // set Camera
    const camera: UniversalCamera = new UniversalCamera("Camera", new Vector3(0,3,-50), scene);
    camera.attachControl(canvas, true);

    // load Environment
    const environment = new Environment(scene)
    await environment.load()

    // load Assets
    const light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);
    const sphere: Mesh = MeshBuilder.CreateSphere("sphere", { diameter: 1 }, scene);

    engine.runRenderLoop(() => {
      scene.render();
    });
  }

  const _createCanvas = () =>{
    
  }

  useEffect(() => {
    _loadEnvironment()
  }, [room])

  return (
    <div>
        
    </div>
  );
}
