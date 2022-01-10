import { ArcRotateCamera, Engine, HemisphericLight, Mesh, MeshBuilder, Scene, StandardMaterial, Texture, UniversalCamera, Vector3 } from '@babylonjs/core';
import { useEffect, useState } from 'react';
import { Link } from 'umi';
import { Space, Button } from "antd"
import styles from './index.less';

export default function IndexPage() {

  return (
    <div style={{width: '100%', height:'100%', textAlign: 'center', backgroundColor: "#f5f5f5", paddingTop: 100}}>
      <Space direction='vertical' style={{marginBottom: 50}}>
        <Button type='primary' size='large' style={{width: 300}}>
          <Link to='/room/1'>Go To Game Room</Link>
        </Button>
        <Button type='ghost' size='large' style={{width: 300}}>
          <Link to='/room/2'>Go To Avatar</Link>
       </Button>
      </Space>
      <div>
        <iframe width="100%" height="800px" src='https://www.yuque.com/docs/share/42cba45a-09bb-49c7-b9bc-02c82c207a18?# 《Babylon》'></iframe>
      </div>
    </div>
  );
}
