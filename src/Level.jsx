import * as THREE from "three";
import { useMemo, useState, useRef, useEffect } from "react";
import Block from "./Block";
import Player from "./Player";
import useGame from "./stores/useGame.jsx";
import { gravityDirectionDict } from "./stores/useGame.jsx";
import { RigidBody } from "@react-three/rapier";
import { Physics } from "@react-three/rapier";
import SceneInspector from "./sceneInspector.jsx";
import Background from "./Background.jsx";

export default function Level({
  count,
  seed = 0,
  types = [Block],
}) {

// const timer = useGLTF("./hourglass4.glb");
// const envMap = './env/scifi_white_sky_scrapers_in_clouds_at_day_time.jpg';
const collidableObjects = useRef([]);




const level = useRef();
const meshObjectsRef = useRef([]);













  const blocks = useMemo(() => {
    const blocks = [];

    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      blocks.push(type);
    }

    return blocks;
  }, [count, types, seed]);

     const gravityDirection = useGame((state) => state.gravityDirection);


  const positions = [
    /// Top face (y = -1)
    [0, -1, 0, "start"], 
    [0, -1, -1, "cube"],
    [0, -1, -2, "cube"],
    [0, -1, -3, "cube"],  
    [1, -1, 0, "cube"],
    [1, -1, -1, "cube"],
    [1, -1, -2, "cube"],
    [1, -1, -3, "cube"],
    [2, -1, 0, "cube"],
    [2, -1, -1, "cube"],
    [2, -1, -2, "cube"],
    [2, -1, -3, "cube"],
    [-1, -1, 0, "cube"],
    [-1, -1, -1, "cube"],
    [-1, -1, -2, "cube"],
    [-1, -1, -3, "cube"], 
    [-2, -1, 0, "end"],
    [-2, -1, -1, "cube"],
    [-2, -1, -2, "cube"],
    [-2, -1, -3, "cube"],

    /// Bottom face (y = -3)
    [0, -3, 0, "cube"], 
    [0, -3, -1, "cube"],
    [0, -3, -2, "cube"],
    [0, -3, -3, "cube"],  
    [1, -3, 0, "cube"],
    [1, -3, -1, "cube"],
    [1, -3, -2, "cube"],
    [1, -3, -3, "cube"],
    [2, -3, 0, "cube"],
    [2, -3, -1, "cube"],
    [2, -3, -2, "cube"],
    [2, -3, -3, "cube"],
    [-1, -3, 0, "cube"],
    [-1, -3, -1, "cube"],
    [-1, -3, -2, "cube"],
    [-1, -3, -3, "cube"], 
    [-2, -3, 0, "cube"],
    [-2, -3, -1, "cube"],
    [-2, -3, -2, "cube"],
    [-2, -3, -3, "cube"],

    /// Front face (z = 0)
    [0, -2, 0, "cube"], 
    [1, -2, 0, "cube"],
    [2, -2, 0, "cube"],
    [-1, -2, 0, "cube"],
    [-2, -2, 0, "cube"],
    [0, -3, 0, "cube"], 
    [1, -3, 0, "cube"],
    [2, -3, 0, "cube"],
    [-1, -3, 0, "cube"],
    [-2, -3, 0, "cube"],

    /// Back face (z = -3)
    [0, -2, -3, "cube"], 
    [1, -2, -3, "cube"],
    [2, -2, -3, "cube"],
    [-1, -2, -3, "cube"],
    [-2, -2, -3, "cube"],
    [0, -3, -3, "cube"], 
    [1, -3, -3, "cube"],
    [2, -3, -3, "cube"],
    [-1, -3, -3, "cube"],
    [-2, -3, -3, "cube"],

    /// Left face (x = -2)
    [-2, -2, 0, "cube"], 
    [-2, -2, -1, "cube"],
    [-2, -2, -2, "cube"],
    [-2, -3, 0, "cube"], 
    [-2, -3, -1, "cube"],
    [-2, -3, -2, "cube"],

    /// Right face (x = 2)
    [2, -2, 0, "cube"], 
    [2, -2, -1, "cube"],
    [2, -2, -2, "cube"],
    [2, -3, 0, "cube"], 
    [2, -3, -1, "cube"],
    [2, -3, -2, "cube"],
];


  


  return (
    <Physics debug={true} gravity={gravityDirection} shadows>
 
      <SceneInspector levelRef={level} />

      <Player
        objects={meshObjectsRef.current}
        blocks={blocks}
        positions={positions}
      />

{/* 
    <primitive object={timer.scene} /> */}
      {/* <Background /> */}
      <group ref={level}>
        
        {positions.map((position, index) => (

          <RigidBody
            key={index}
            type="fixed"
            colliders="cuboid"
            restitution={1}
            friction={1}
            position={[0, 0, 0]}
          >
            <Block
              key={index}
              position={position.slice(0, 3)}
              blockType={position[3]}
            />
           </RigidBody>
        ))}
      </group>
      </Physics>
  );
}
