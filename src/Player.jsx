import * as THREE from "three";
import { useRapier, RigidBody, quat, vec3, euler, RapierRigidBody } from "@react-three/rapier"; // Correct import for Quat and Euler
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls, useGLTF, Sparkles, TransformControls, PivotControls, Center } from "@react-three/drei";
import {  useEffect, useCallback, useRef, useState } from "react";
import useGame from "./stores/useGame.jsx";
import { playFall, playLand, playStart } from "./Audio.jsx";
import { gravityDirectionDict } from "./stores/useGame.jsx";
import { gsap } from "gsap";

import { useControls } from 'leva'

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

  //console.log(blocks)

  const [blockPositions, setBlockPositions] = useState(0);
  const gravityDirection = useGame((state) => state.gravityDirection);
  const setGravityDirection = useGame((state) => state.setGravityDirection);
  const gameGravityDirection = useGame((state) => state.gravityDirection);

  const gravityDirectionDict = {
    top: [0, -10, 0], // Top face
    bottom: [0, 10, 0], // Bottom face
    right: [-10, 0, 0], // Right face
    left: [10, 0, 0], // Left face
    front: [0, 0, 10], // Front face
    back: [0, 0, -10], // Back face
  }

  const [gamerGD, setGamGD] = useState(gravityDirectionDict.top);



  useEffect(() => {
      // Access positions array here and do something with it
      //console.log('Block positions:', positions);

      // Array to store merged Vector3 values
      const mergedPositions = [];

      // Loop through positions and merge into a single array
      positions.forEach(position => {
        const vector3 = new THREE.Vector3(position[0], position[1], position[2]);
        mergedPositions.push(vector3);
      });

      setBlockPositions(mergedPositions)
      // Now mergedPositions contains all Vector3 values as a single array
     // console.log('new position',mergedPositions);

      // positions.forEach(position => {
      //   const vector3 = new THREE.Vector3(position[0], position[1], position[2]);
      //   // Now vector3 contains the x, y, and z coordinates for the current position
      //   console.log(vector3);
      // });

  }, [positions]);

  const start = useGame((state) => state.start);
  const end = useGame((state) => state.end);
  const restart = useGame((state) => state.restart);
  const blocksCount = useGame((state) => state.blocksCount);
  const [orientation, setOrientation] = useState(Math.PI);

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
   // console.log('csi',  direction);
  }, [cameraStateIndex]);


  const jump = () => {
    //console.log('Yes, jump!')
    //const origin = body.current.translation();
    // origin.y -= 0.61;
    // const direction = { x: 0, y: -1, z: 0 };
    // const ray = new rapier.Ray(origin, direction);
    // const hit = world.castRay(ray, 10, true);

    // //console.log(hit.toi)
    // if (hit.toi < 0.15) playLand(); // Play the sound when the ball lands

    body.current.applyImpulse({ x: 0, y: 8, z: 0 });
  };



  const setPlayerMove = useCallback(() => {


   
    // const impulseDirection = new THREE.Vector3(0, 0, -1);
    // impulseDirection.applyQuaternion(player.current.quaternion);
  
    // const impulseStrength = 1; // Adjust the strength of the impulse as needed
  
    // body.current.applyImpulse({
    //   x: impulseDirection.x * impulseStrength,
    //   y: impulseDirection.y * impulseStrength,
    //   z: impulseDirection.z * impulseStrength,
    // });
   
    const moveDirection = new THREE.Vector3(0, 0, -1);
    moveDirection.applyQuaternion(player.current.quaternion).normalize();
  
    const moveDistance = 1; // Adjust the distance of movement as needed
    const moveSpeed = 0.1; // Adjust the speed of movement as needed

  const currentPosition = body.current.translation();
  const newPosition = {
    x: currentPosition.x + moveDirection.x * moveSpeed * moveDistance,
    y: currentPosition.y + moveDirection.y * moveSpeed * moveDistance,
    z: currentPosition.z + moveDirection.z * moveSpeed * moveDistance,
  };

    //console.log('moving')
    //console.log('newPosition',newPosition)
   // console.log('newPosition',newPosition)

    
    body.current.setTranslation(newPosition);

    const smoothedPosition = {
      x: Math.round(newPosition.x),
      y: Math.round(newPosition.y),
      z: Math.round(newPosition.z),
    };
    //body.current.setTranslation(newPosition);

    //console.log('smoothed postion',smoothedPosition)
    // newPosition.x += Math.ceil(moveDirection.x * moveSpeed * moveDistance / cubeWidth) * cubeWidth;
    // newPosition.y += Math.ceil(moveDirection.y * moveSpeed * moveDistance / cubeWidth) * cubeWidth;
    // newPosition.z += Math.ceil(moveDirection.z * moveSpeed * moveDistance / cubeWidth) * cubeWidth;

    
  }, []);



  // const targetDirection = new THREE.Vector3(0, 0, -1); // Assuming the forward direction
  // const duration = 1; // Set the desired duration in seconds

  // // Apply the player's rotation to the direction vector
  // targetDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), player.current.rotation.y);
  
  // // Scale the direction by the desired movement distance (width of the block)
  // targetDirection.multiplyScalar(1); // Always move in increments of 1 box width
  
  // const targetPosition = new THREE.Vector3().copy(player.current.position).add(targetDirection);

  //    // Use GSAP to tween the player's position
  //    gsap.to(player.current.position, {
  //     duration,
  //     x: targetPosition.x,
  //     y: targetPosition.y,
  //     z: targetPosition.z,
  //     ease: "power2.inOut",
  //     onComplete: () => {
  //         // Reset the flag when the tween is complete
  //         isPlayerMoving = false;
  //     },
  // });





  // const setPlayerMove = () => {
  //   const targetPosition = new THREE.Vector3();
  //   targetPosition.copy(player.current.position);
  //   targetPosition.z -= 1;
  //   // Use lerp to smoothly interpolate between current position and target position
  //   player.current.position.lerp(targetPosition, 0.1);
  // };


  const setPlayerRotateLeft = () => {
    console.log('lll')

    player.current.rotation.y += Math.PI / 2; // Rotate +90 degrees
    console.log(player.current.rotation.y)
  };

  const setPlayerRotateRight = () => {
    console.log('rrr')
    player.current.rotation.y -= Math.PI / 2; // Rotate -90 degrees

  };





 const color = useControls({
      directional_color: '#00ff9f',
      ambient_color: '#7600ff',
    })
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
        //   console.log("direction:", movementState);
        }
      }
    );

    const unsubscribeLeft = subscribeKeys(
      (state) => state.leftward,
      (value) => {
        if (value) {
          setMovementState(MovementState.MOVE_LEFT);
          setCameraStateIndex((prevIndex) => (prevIndex + 1) % 4);
    

          const targetDirection = new THREE.Vector3(0, 0, -1); // Assuming the forward direction
          const duration = 1; // Set the desired duration in seconds
      
          // Apply the player's rotation to the direction vector
          targetDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), player.current.rotation.y);
          
          // Scale the direction by the desired movement distance (width of the block)
          targetDirection.multiplyScalar(1); // Always move in increments of 1 box width
          
          const targetPosition = new THREE.Vector3().copy(player.current.position).add(targetDirection);
        
             // Use GSAP to tween the player's position
             gsap.to(player.current.rotation, {
              duration: 0.3, // Adjust the duration for the desired speed
              
              y: player.current.rotation.y + Math.PI / 2,
            
              ease: "linear", // Use linear easing for uniform speed
              // onComplete: () => {
              //   isPlayerMoving = false;
              // },
            });


            // if (body.current) {
            //   // Create a quaternion with the desired rotation

            //   // Set the new rotation to the Rapier Rigidbody
            //   console.log('before',body.current.rotation())

            //   let currentQuaternionRotation = body.current.rotation(); // Make sure to clone the current quaternion
          
            //   const quat = new THREE.Quaternion();
            //   console.log('quat',quat)

            //   quat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), THREE.MathUtils.degToRad(80));
            //   body.current.setRotation(quat);
            //   console.log('after',body.current.rotation().y)
              
            // }


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
          //body.current.rotation.y += Math.PI / 2; // Rotate by 90 degrees
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


  const [isHitWall,setHitWall] = useState('red');
  const [isHitEdge,setHitEdge] = useState('red');


  const colorHit = useControls({
    hit_wall: isHitWall,
    hit_edge: isHitEdge,
  })



  // const raycasterDown = new THREE.Raycaster();
  // const raycasterForward = new THREE.Raycaster();




useFrame((state, delta) => {
    const { forward , leftward, rightward} = getKeys();
    const playerPosition = player.current?.position;
    const bodyPosition = body.current?.translation();

    const { x: camPosX, y: camPosY, z: camPosZ } = camPosition;



    const currentPosition = body.current.translation();
      const newPosition = {
        x: currentPosition.x ,
        y: currentPosition.y ,
        z: currentPosition.z,
      };

  


  // const directionDown = new THREE.Vector3(0, -1, 0);
  // const directionForward = new THREE.Vector3(0, 0, -1);
  // directionForward.applyQuaternion(player.current.quaternion).normalize();

  // raycasterDown.set(new THREE.Vector3(newPosition.x, newPosition.y, newPosition.z), directionDown);
  // raycasterForward.set(new THREE.Vector3(newPosition.x, newPosition.y, newPosition.z), directionForward);

  // const intersectsDown = raycasterDown.intersectObjects(blockPositions.map(position => new THREE.Mesh()));
  // const intersectsForward = raycasterForward.intersectObjects(blockPositions.map(position => new THREE.Mesh()));

  // const distanceThresholdDown = 1;
  // const distanceThresholdForward = 5;

  // const isFacingDown = intersectsDown.some(intersection => intersection.distance < distanceThresholdDown);
  // const isFacingForward = intersectsForward.some(intersection => intersection.distance < distanceThresholdForward);

  // if (isFacingDown) {
  //   // Handle facing down
  //   console.log("Facing down!");
  // }

  // if (isFacingForward) {
  //   // Handle facing forward
  //   console.log("Facing forward!");
  // }


    if (playerPosition) {


      if (forward) {
        setIsKeyPressed(true);
        setMovementState(MovementState.FORWARD);

        //console.log('PP:',newPosition)
        const isAtFloorEdge = newPosition.y <= 0;
        const playerFrontPosition = new THREE.Vector3(newPosition.x, 0, newPosition.z); // Assuming the floor is at y = 0
        //console.log('PFP:',playerFrontPosition)

        const blockWidthThreshold = 2; // Set a threshold for proximity to the block

        const isFacingBlock = blockPositions.some(blockPosition => {
          const roundedNewPosition = {
            x: Math.round(newPosition.x),
            y: Math.round(newPosition.y),
            z: Math.round(newPosition.z),
          };
        
          const roundedBlockPosition = {
            x: Math.round(blockPosition.x),
            y: Math.round(blockPosition.y),
            z: Math.round(blockPosition.z),
          };
        
          const distanceToBlock = new THREE.Vector2(roundedNewPosition.x - roundedBlockPosition.x, roundedNewPosition.z - roundedBlockPosition.z).length();
          
          // Check if the block is at the exact rounded position as the player
          return distanceToBlock < blockWidthThreshold && roundedNewPosition.y === roundedBlockPosition.y;
        });
        
        if (isFacingBlock) {
          // Handle facing a block at the exact rounded position
          setHitWall('green')
          console.log("Facing a block at the exact rounded position!");

          //get direction from edge target
          setGravityDirection(gravityDirectionDict.back)
        }
        
        console.log(gravityDirection)
      
      
        if (isAtFloorEdge) {
          // Handle approaching floor edge
          setHitEdge('green')
          console.log("Approaching floor edge!");
        }
      


      } else {
        setIsKeyPressed(false);
      }






     handleContinuousMovement();
      // if (forward) {
      //   setPlayerMove(playerMovementTop[cameraStateIndex]);

      // }

      // if (leftward) {
      //   console.log('leftward')
      //   setPlayerRotateLeft();

      // } else if (rightward) {
      //   setPlayerRotateRight();

      // }

      //   if(body){
      // const rot = body.current.rotation;
      // console.log(rot)
      //   }


     //console.log('PP',body?.current.translation())

     const myVector = new THREE.Vector3(bodyPosition.x, bodyPosition.y, bodyPosition.z);

// Now myVector contains your coordinates as a Vector3
//console.log('myVec',myVector);


      const cameraPosition = myVector.clone().add(new THREE.Vector3(camPosX, camPosY, camPosZ));
      const cameraTarget = myVector.clone().add(new THREE.Vector3(0, 0.25, 0));
      
      // Use the cameraTarget variable in the following lines
      smoothedCameraPosition.lerp(cameraPosition, 5 * delta);
      smoothedCameraTarget.lerp(cameraTarget, 5 * delta);

      // Set camera position and look at the player
      state.camera.position.copy(smoothedCameraPosition);
      state.camera.lookAt(smoothedCameraTarget);
      state.camera.up.set(0, 1, 0);


 

    }

    // if (player.current && transformControls.current) {
    //   // Update TransformControls rotation based on player's rotation
    //   transformControls.current.position.copy(player.current.position);
    //   transformControls.current.rotation.copy(player.current.rotation);
    //     // Lock X and Z model rotations and update rotation Y
    //     // const quaternionRotation = new THREE.Quaternion();
    //     // quaternionRotation.setFromEuler(new THREE.Euler(0, Math.atan2(Math.sin(2.356), Math.cos(2.356)), 0));
    //     // body.current.setRotation(quaternionRotation);

    // }

  });



  return (
    
        // <TransformControls  
        // ref={transformControls} 

        // object={player.current} position={[0,0,0]} >

                    <RigidBody
                        //    enabledRotations={[false, true, true]}

      type="dynamic"
      colliders="ball"
      ref={body}
      position={[0,2, 0]}
      lockRotations={true}
      mass={10}
      restitution={0.2}
      friction={1}
    //  enabledRotation={[false,false,false]}

    >

        <mesh
          ref={player}
          
        >
                      {/* <meshStandardMaterial color="pink" /> */}
                      <boxGeometry />

          {/* <sphereGeometry args={[0.25, 16, 16]} /> */}
        </mesh>
        </RigidBody>
     
    // </TransformControls>  
  );
}
