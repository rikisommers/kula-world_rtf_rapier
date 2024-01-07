import * as THREE from "three";
import { useRapier, RigidBody } from "@react-three/rapier"; // Correct import for Quat and Euler
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls, useGLTF, Sparkles, TransformControls, PivotControls, Center } from "@react-three/drei";
import {  useEffect, useCallback, useRef, useState } from "react";
import useGame from "./stores/useGame.jsx";
import { playFall, playLand, playStart } from "./Audio.jsx";
import { gravityDirectionDict } from "./stores/useGame.jsx";
import { gsap } from "gsap";

const directionMap = {
  0: "forward",
  1: "left",
  2: "back",
  3: "right",
};


export default function Player({
  playerPosition,
  blocks,
  positions,
  onPlayerPositionChange,
  onPlayerDirectionChange,
  onCameraDirectionChange,
}) {
  const ball = useGLTF("");

  console.log(blocks)

  
  useEffect(() => {
    // Access positions array here and do something with it
    console.log('Block positions:', positions);
  }, [positions]);
  const start = useGame((state) => state.start);
  const end = useGame((state) => state.end);
  const restart = useGame((state) => state.restart);
  const blocksCount = useGame((state) => state.blocksCount);

  const playerMovementTop = useGame((state) => state.playerMovementTop);

  const [subscribeKeys, getKeys] = useKeyboardControls();
const [isKeyPressed, setIsKeyPressed] = useState(false);

  const { rapier, world } = useRapier();
  const body = useRef();
  const player = useRef();
  const transformControls = useRef();

  const dist = 5;


  const MovementState = {
    IDLE: "idle",
    FORWARD: "forward",
    BACKWARD: "backward",
    MOVE_LEFT: "move_left",
    MOVE_RIGHT: "move_right",
  };

  const [movementState, setMovementState] = useState(MovementState.IDLE);
  const [camPosition, setCamPosition] = useState(new THREE.Vector3(10, 10, 10));
  const [cameraStateIndex, setCameraStateIndex] = useState(0);

  const cameraDirectionsTop = [
    { x: 0, y: 1, z: 3 }, // Forward
    { x: 3, y: 1, z: 0 }, // Move Left
    { x: 0, y: 1, z: -3 }, // Backward
    { x: -3, y: 1, z: 0 }, // Move Right
  ];


  
  useEffect(() => {
    const direction = directionMap[cameraStateIndex];
    
    //send updated direction to level -- not required??
    onPlayerDirectionChange(direction);

    // rotate camera around player pos
    setCamPosition(cameraDirectionsTop[cameraStateIndex]);
    //setPlayerMove(playerMovementTop[cameraStateIndex]);


    console.log('csi',  direction);


    
  }, [cameraStateIndex]);

  

  const applyImpulse = (force) => {
    console.log('impulse')

    body.current.applyImpulse(force);
  };


  // const jump = () => {
   //     console.log('jump')

  //   //console.log('Yes, jump!')
  //   const origin = body.current.translation();
  //   origin.y -= 0.61;
  //   const direction = { x: 0, y: -1, z: 0 };
  //   const ray = new rapier.Ray(origin, direction);
  //   const hit = world.castRay(ray, 10, true);

  //   //console.log(hit.toi)
  //   if (hit.toi < 0.15) playLand(); // Play the sound when the ball lands

  //   body.current.applyImpulse({ x: 0, y: 4, z: 0 });
  //   // body.current.setLinvel({ x: 0, y: 0.5, z: 1 })
  // };



  const jump = () => {

    console.log('jump')
    const origin = body.current.translation();
    origin.y -= 0.61;
    const direction = { x: 0, y: -1, z: 0 };
    const ray = new rapier.Ray(origin, direction);
    const hit = world.castRay(ray, 10, true);
  
    if (hit.toi < 0.15) playLand(); // Play the sound when the ball lands
  
    applyImpulse({ x: 0, y: 4, z: 0 });
  };



  let isPlayerMoving = false;

  const setPlayerMove = useCallback(() => {
    if (isPlayerMoving) {
      return;
    }

    isPlayerMoving = true;

    const targetDirection = new THREE.Vector3(0, 0, -1); // Assuming the forward direction
    const distance = 1; // Set the desired distance to move

    // Apply the player's rotation to the direction vector
    targetDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), player.current.rotation.y);

    // Scale the direction by the desired movement distance
    const deltaPosition = targetDirection.clone().multiplyScalar(distance);

    // Calculate the new position
    const newPosition = player.current.position.clone().add(deltaPosition);

    // Use GSAP to tween the player's position
    gsap.to(player.current.position, {
      duration: 0.2, // Adjust the duration for the desired speed
      x: newPosition.x,
      y: newPosition.y,
      z: newPosition.z,
      ease: "linear", // Use linear easing for uniform speed
      onComplete: () => {
        isPlayerMoving = false;
      },
    });
  }, []);

  // const setPlayerMove = () => {
  //   const targetPosition = new THREE.Vector3();
  //   targetPosition.copy(player.current.position);
  //   targetPosition.z -= 1;
  //   // Use lerp to smoothly interpolate between current position and target position
  //   player.current.position.lerp(targetPosition, 0.1);
  // };


  // const setPlayerRotateLeft = () => {
  //   console.log('lll')

  //   player.current.rotation.y += Math.PI / 2; // Rotate +90 degrees
  //   console.log(player.current.rotation.y)
  // };

  // const setPlayerRotateRight = () => {
  //   console.log('rrr')
  //   player.current.rotation.y -= Math.PI / 2; // Rotate -90 degrees

  // };






  const reset = () => {
    console.log("reset");
  };




  useEffect(() => {
    const unsubscribeReset = useGame.subscribe(
      (state) => state.phase,
      (value) => {
        if ((value === "ready") | "ended") reset();
      }
    );

    const unsubscribeAny = subscribeKeys(() => {
      start();
    });

    const unsubscribeBack = subscribeKeys(
      (state) => state.backward,
      (value) => {
        if (value) {
          setMovementState(MovementState.BACKWARD);
        }
      }
    );

    const unsubscribeForward = subscribeKeys(
      (state) => state.forward,
      (value) => {
        if (value) {
          setMovementState(MovementState.FORWARD);
           console.log("direction:", movementState);
        }
      }
    );

    const unsubscribeLeft = subscribeKeys(
      (state) => state.leftward,
      (value) => {
        if (value) {
          setMovementState(MovementState.MOVE_LEFT);
          setCameraStateIndex((prevIndex) => (prevIndex + 1) % 4);
          player.current.rotation.y += Math.PI / 2; // Rotate by 90 degrees

        }
      }
    );

    const unsubscribeRight = subscribeKeys(
      (state) => state.rightward,
      (value) => {
        if (value) {
          setMovementState(MovementState.MOVE_RIGHT);
          setCameraStateIndex((prevIndex) => (prevIndex - 1 + 4) % 4);
          player.current.rotation.y -= Math.PI / 2; // Rotate by 90 degrees
        }
      }
    );

    const unsubscribeJump = subscribeKeys(
      (state) => state.jump,
      (value) => {
        if (value) jump();
      }
    );
    return () => {
      unsubscribeJump();
      unsubscribeForward();
      unsubscribeBack();
      unsubscribeLeft();
      unsubscribeRight();
      unsubscribeAny();
      unsubscribeReset();
    };
  }, []);

  //set cam back
  const [smoothedCameraPosition] = useState(() => camPosition);
  const [smoothedCameraTarget] = useState(() => new THREE.Vector3());
  const [smoothedPlayerPosition] = useState(() => new THREE.Vector3());

  const handleContinuousMovement = useCallback(() => {
    if (isKeyPressed && movementState === MovementState.FORWARD) {
      setPlayerMove();
    }
  }, [isKeyPressed, movementState]);

  useFrame((state, delta) => {
    const { forward , leftward, rightward} = getKeys();
    const playerPosition = player.current?.position;
    const { x: camPosX, y: camPosY, z: camPosZ } = camPosition;

    if (playerPosition) {
    if (forward) {
      setIsKeyPressed(true);
      setMovementState(MovementState.FORWARD);
    } else {
      setIsKeyPressed(false);
    }

    handleContinuousMovement();

  
    let bodyPosition = body.current.translation();
    if (bodyPosition.y < -10) {
      restart();
    }

    
      // if (forward) {
      //   setPlayerMove(playerMovementTop[cameraStateIndex]);

      // }

      // if (leftward) {
      //   console.log('leftward')
      //   setPlayerRotateLeft();

      // } else if (rightward) {
      //   setPlayerRotateRight();

      // }


      const cameraPosition = playerPosition.clone().add(new THREE.Vector3(camPosX, camPosY, camPosZ));
      const cameraTarget = playerPosition.clone().add(new THREE.Vector3(0, 0.25, 0));
      
      // Use the cameraTarget variable in the following lines
      smoothedCameraPosition.lerp(cameraPosition, 5 * delta);
      smoothedCameraTarget.lerp(cameraTarget, 5 * delta);

      // Set camera position and look at the player
      state.camera.position.copy(smoothedCameraPosition);
      state.camera.lookAt(smoothedCameraTarget);
      state.camera.up.set(0, 1, 0);

    }

    if (player.current && transformControls.current) {
      // Update TransformControls rotation based on player's rotation
      transformControls.current.position.copy(player.current.position);

      transformControls.current.rotation.copy(player.current.rotation);
    }

  });





  return (
    
        <TransformControls  
        ref={transformControls} 
        object={player.current} position={[0,0,0]} >
<RigidBody
  type="kinematicPosition"
  ref={body}
  colliders="cuboid"
  enabledRotations={[false, true, true]}
  restitution={1}
  friction={1}
  position={[0, 0, 0]}
>
        <mesh
          ref={player}
          
        >
                      {/* <meshStandardMaterial color="pink" /> */}
                      <boxGeometry />

          {/* <sphereGeometry args={[0.25, 16, 16]} /> */}
        </mesh>
        </RigidBody>
    </TransformControls>  
  );
}
