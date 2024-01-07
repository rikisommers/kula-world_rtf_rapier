import * as THREE from "three";
import { useMemo, useState, useRef, useEffect } from "react";
import Block from "./Block";
import Player from "./Player";
import useGame from "./stores/useGame.jsx";
import { gravityDirectionDict } from "./stores/useGame.jsx";
import { RigidBody } from "@react-three/rapier";
import { Physics } from "@react-three/rapier";

export default function Level({
  count,
  seed = 0,
  types = [Block],
  onGravityDirectionChange,
  onLevelRotationChange,
}) {

// const timer = useGLTF("./hourglass4.glb");
// const envMap = './env/scifi_white_sky_scrapers_in_clouds_at_day_time.jpg';

  const level = useRef();
  const gravityDirection = useGame((state) => state.gravityDirection);

  const blocks = useMemo(() => {
    const blocks = [];

    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      blocks.push(type);
    }

    return blocks;
  }, [count, types, seed]);

  const setGravityDirection = useGame((state) => state.setGravityDirection);
  const gameGravityDirection = useGame((state) => state.gravityDirection);
  const [gd, setGd] = useState(gameGravityDirection);

  const positions = [
    /// Level 1

    // x y z
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

  ];

  const [playerPosition, setPlayerPosition] = useState(new THREE.Vector3());
  const [playerDirection, setPlayerDirection] = useState("forward");

  useEffect(() => {
    const roundedPosition = new THREE.Vector3(
      playerPosition.x.toFixed(2),
      playerPosition.y.toFixed(2),
      playerPosition.z.toFixed(2)
    );
    cgd(playerDirection, playerPosition);
  }, [playerPosition]);
//gameGravityDirection

  // Function to find the matching direction
  function findMatchingDirection(target) {
    for (const direction in gravityDirectionDict) {
      if (
        JSON.stringify(gravityDirectionDict[direction]) ===
        JSON.stringify(target)
      ) {
        return direction;
      }
    }
    return null; // Return null if no match is found
  }

  const cgd = (direction, position) => {

    const ex = positions[0].slice(0, 1)[0];
    const ez = positions[0].slice(2, 3)[0];
    const ey = positions[0].slice(1, 2)[0];

    const px = parseInt(position.x);
    const pz = parseInt(position.z);
    const py = parseInt(position.y - 1);


    const threshold = 1.2;


    if (JSON.stringify(gameGravityDirection) === JSON.stringify(gravityDirectionDict.top)) {

//      console.log('top', py)


      if (direction === "forward") {
        if (py <= -threshold) {
          setGravityDirection(gravityDirectionDict.front);
        }
      }

      if(direction === "left"){
        if (py <= -threshold) {
        setGravityDirection(gravityDirectionDict.left)
        }
      }

      if(direction === "right"){
        if (py <= -threshold) {
        setGravityDirection(gravityDirectionDict.right)
        }
      }

      if(direction === "back"){
        if (py <= -threshold) {
        setGravityDirection(gravityDirectionDict.back)
        }
      }
    }

    ///...

    if (JSON.stringify(gameGravityDirection) === JSON.stringify(gravityDirectionDict.front)) {
      
      console.log('front', py)
      
      if (direction === "forward" || direction === "back") {

        // console.log('front', py,px,pz)
        // //console.log('trhe', threshold)

        
    //    if (pz >= -3) {
        //   setGravityDirection(gravityDirectionDict.top);
        // }
      }
  
    }
  


  

  ///...
  
 
};





  return (
    <Physics debug={true} gravity={gravityDirection} shadows>
 

      <Player
  playerPosition={playerPosition}
  blocks={blocks}
  positions={positions}
        onPlayerPositionChange={setPlayerPosition}
        onPlayerDirectionChange={setPlayerDirection}
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
