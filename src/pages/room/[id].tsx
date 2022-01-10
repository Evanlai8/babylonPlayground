
import { useEffect, useState } from 'react';
import { useParams } from 'umi';
import { ArcRotateCamera, Engine, HemisphericLight, Mesh, MeshBuilder, Scene, StandardMaterial, Texture, UniversalCamera, Vector3 } from '@babylonjs/core';
import { Space, Button } from "antd"
import Environment from './environment'
import Room1 from './room1'
import Room2 from './room2'
import styles from './index.less';

let engine: Engine
let scene: Scene

const Room = () => {
  const params = useParams();
  const roomId = params?.id

  const initializeSence = async() => {
    // build canvas
    let canvas = document.getElementById("gameCanvas")
    if(!canvas){
        canvas = document.createElement("canvas")
    }
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    engine = new Engine(canvas, true);
    scene = new Scene(engine);

    // load Environment

    // load Environment
    //const environment = new Environment(scene)
    let room 
    if(roomId == 1){
       room = new Room1(scene, canvas) 
    }else{
       room = new Room2(scene, canvas)
    }
    // load
    engine.displayLoadingUI()
    console.log("roomId", roomId, room)
    await room.load()
    setTimeout(() => {
        engine.hideLoadingUI()
    }, 1000);
    // load Assets

    engine.runRenderLoop(() => {
        scene.render();
    });
    
  }

  useEffect(() => {
    initializeSence()
  }, [roomId])
  
  return (
        <canvas id='gameCanvas'></canvas>
  );
}

export default Room
