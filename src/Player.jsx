import * as THREE from "three";
import {
  useRapier,
  RigidBody,
  quat,
  vec3,
  euler,
  RapierRigidBody,
} from "@react-three/rapier"; // Correct import for Quat and Euler
import { useFrame } from "@react-three/fiber";
import {
  useKeyboardControls,
  useGLTF,
  Sparkles,
  TransformControls,
  PivotControls,
  Center,
} from "@react-three/drei";
import { useEffect, useCallback, useRef, useState } from "react";
import useGame from "./stores/useGame.jsx";
import { playFall, playLand, playStart } from "./Audio.jsx";
import { gravityDirectionDict } from "./stores/useGame.jsx";
import { gsap } from "gsap";
import { useThree } from '@react-three/fiber'

import { useControls } from "leva";

const directionMap = {
  0: "forward",
  1: "left",
  2: "back",
  3: "right",
};

export default function Player({ blocks, positions, objects}) {
  const [blockPositions, setBlockPositions] = useState(0);
  const gravityDirection = useGame((state) => state.gravityDirection);
  const setGravityDirection = useGame((state) => state.setGravityDirection);
  const setCameraDirection = useGame((state) => state.setCameraDirection);
  const objp = useGame((state) => state.objectPositions);


 // console.log('___________-__-_-_',objp)
  //console.log(blocks, positions, objects)


  const MovementState = {
    IDLE: "idle",
    FORWARD: "forward",
    BACKWARD: "backward",
    MOVE_LEFT: "move_left",
    MOVE_RIGHT: "move_right",
  };

  const [movementState, setMovementState] = useState(MovementState.IDLE);
  const [camPosition, setCamPosition] = useState(new THREE.Vector3(10, 10, 10));

  const [bodyPosition, setBodyPosition] = useState(new THREE.Vector3(0, 2, 0));

  const [cameraStateIndex, setCameraStateIndex] = useState(0);
  const [liveGravityDirection, setLiveGravityDirection] = useState(
    new THREE.Vector3(0, -10, 0)
  );
  const [livePlayerDirection, setLivePlayerDirection] = useState(
    new THREE.Vector3(0, 0, -1)
  );
  var lpd = new THREE.Vector3(0, 0, -1);

  //set cam back
  const [smoothedCameraPosition] = useState(() => camPosition);
  const [smoothedCameraTarget] = useState(() => new THREE.Vector3());
  const [smoothedPlayerPosition] = useState(() => new THREE.Vector3());
  const [playerDirection] = useState(() => new THREE.Vector3());
  const [hasHitWall, setHasHitWall] = useState(false);

  const raycasterForward = new THREE.Raycaster();
  
  const raycasterDown = new THREE.Raycaster();
  raycasterDown.far = 1; // Set the far property to an appropriate value
  raycasterForward.far = 1; // Set the far property to an appropriate value

  const start = useGame((state) => state.start);
  const end = useGame((state) => state.end);
  const restart = useGame((state) => state.restart);

  const [subscribeKeys, getKeys] = useKeyboardControls();
  const [isKeyPressed, setIsKeyPressed] = useState(false);

  const { rapier, world } = useRapier();
  const body = useRef();
  const player = useRef();
  const transformControls = useRef();

  const cameraDirectionsTop = [
    { x: 0, y: 1, z: 3 }, // Forward
    { x: 3, y: 1, z: 0 }, // Move Left
    { x: 0, y: 1, z: -3 }, // Backward
    { x: -3, y: 1, z: 0 }, // Move Right
  ];
  const cameraDirectionsFront = [
    { x: 0, y: 3, z: 0 }, // Forward
    { x: 0, y: 1, z: 3 }, // Move Left
    { x: 0, y: -3, z: 0 }, // Backward
    { x: 0, y: 1, z: -3 }, // Move Right
  ];
  const cameraDirectionsBack = [
    { x: 3, y: 1, z: 0 }, // Forward
    { x: 0, y: 3, z: 0 }, // Move Up
    { x: -3, y: -1, z: 0 }, // Backward
    { x: 0, y: -3, z: 0 }, // Move Down
  ];

  const gravityDirectionDict = {
    top: [0, -10, 0], // Top face
    bottom: [0, 10, 0], // Bottom face
    right: [-10, 0, 0], // Right face
    left: [10, 0, 0], // Left face
    front: [0, 0, 10], // Front face
    back: [0, 0, -10], // Back face
  };

  const dist = 5;

  const playerMovementTop = [
    { x: 0, y: 0, z: -dist }, // Forward
    { x: -dist, y: 0, z: 0 }, // Move Left
    { x: 0, y: 0, z: dist }, // Backward
    { x: dist, y: 0, z: 0 }, // Move Right
  ];

  const playerMovementFront = [
    { x: 0, y: dist, z: 0 }, // Move Up
    { x: 0, y: 0, z: -dist }, // Forward
    { x: 0, y: -dist, z: 0 }, // Move Down
    { x: 0, y: 0, z: dist }, // Backward
  ];

  const playerMovementLeft = [
    { x: 0, y: dist, z: 0 }, // Move Up
    { x: dist, y: 0, z: 0 }, // Move Right
    { x: 0, y: -dist, z: 0 }, // Move Down
    { x: -dist, y: 0, z: 0 }, // Move Left
  ];

  const playerMovementBack = [
    { x: 0, y: dist, z: 0 }, // Move Up
    { x: 0, y: 0, z: dist }, // Backward
    { x: 0, y: -dist, z: 0 }, // Move Down
    { x: 0, y: 0, z: -dist }, // Forward
  ];

  const playerMovementRight = [
    { x: 0, y: dist, z: 0 }, // Move Up
    { x: -dist, y: 0, z: 0 }, // Move Left
    { x: 0, y: -dist, z: 0 }, // Move Down
    { x: dist, y: 0, z: 0 }, // Move Right
  ];

  const playerMovementBottom = [
    { x: 0, y: -dist, z: 0 }, // Move Down
    { x: 0, y: 0, z: -dist }, // Forward
    { x: 0, y: dist, z: 0 }, // Move Up
    { x: 0, y: 0, z: dist }, // Backward
  ];

  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------



  const updateLocalGravity = useCallback(() => {

    const gravityUp = new THREE.Vector3(...gravityDirection);
    
    // Rotate the gravity direction according to the player's rotation
    const rotatedGravity = gravityUp.applyQuaternion(player.current?.quaternion);


    
    // Set the local gravity direction based on the rotated gravity
    setGravityDirection(rotatedGravity);
    console.log('Applied gravity',rotatedGravity)
    console.log('World gravity',world.gravity)


  }, []);


  useEffect(() => {
    console.log('update local gravity',gravityDirection)
    // Update local gravity direction when player rotation changes
    updateLocalGravity();
  }, [player.position]);




    //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------


  function arraysMatch(arr1, arr2) {
    if (arr1.length !== arr2.length) {
      return false;
    }
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) {
        return false;
      }
    }
    return true;
  }

  function getRoundedVector(moveDirection) {
    const roudedVector = {
      x: Math.round(moveDirection.x),
      y: Math.round(moveDirection.y),
      z: Math.round(moveDirection.z),
    };
    return roudedVector;
  }

  function getRoundedVector2(moveDirection) {
    // Round the vector components
    const roundedVector = {
      x: Math.round(moveDirection.x),
      y: Math.round(moveDirection.y),
      z: Math.round(moveDirection.z),
    };

    // Normalize the vector components to be within the range of [-1, 1]
    const length = Math.sqrt(
      roundedVector.x * roundedVector.x +
        roundedVector.y * roundedVector.y +
        roundedVector.z * roundedVector.z
    );

    const normalizedVector = {
      x: length !== 0 ? roundedVector.x / length : 0,
      y: length !== 0 ? roundedVector.y / length : 0,
      z: length !== 0 ? roundedVector.z / length : 0,
    };

    return normalizedVector;
  }

  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------

  useEffect(() => {
    if (movementState === MovementState.FORWARD) {
      setHasHitWall(false);
    }
  }, [movementState]);

  useEffect(() => {
  //  console.log("Updated livePlayerDirection:", bodyPosition);
    // other code
    

  }, [bodyPosition]);




  useEffect(() => {
    // Access positions array here and do something with it
    //console.log('Block positions:', positions);

    // Array to store merged Vector3 values
    const mergedPositions = [];

    // Loop through positions and merge into a single array
    positions.forEach((position) => {
      const vector3 = new THREE.Vector3(position[0], position[1], position[2]);
      mergedPositions.push(vector3);
    });

    setBlockPositions(mergedPositions);
    // Now mergedPositions contains all Vector3 values as a single array
    // console.log('new position',mergedPositions);

    // positions.forEach(position => {
    //   const vector3 = new THREE.Vector3(position[0], position[1], position[2]);
    //   // Now vector3 contains the x, y, and z coordinates for the current position
    //   console.log(vector3);
    // });
  }, [positions]);



  useEffect(() => {
    //console.log('cam updates')
    // console.log('A',gravityDirection)
    // console.log('B',gravityDirectionDict.back)
    // console.log(arraysMatch(gravityDirection,gravityDirectionDict.back))

    const direction = directionMap[cameraStateIndex];
    //send updated direction to level -- not required??
    //onPlayerDirectionChange(direction);

    // rotate camera around player pos
    const cameraUpLeft = new THREE.Vector3(0, 1, 0);
    const cameraUpRight = new THREE.Vector3(0, 1, 0);
    const cameraUpBack = new THREE.Vector3(0, 1, 0);
    const cameraUpBottom = new THREE.Vector3(0, 1, 0);
    setCamPosition(cameraDirectionsTop[cameraStateIndex]);

   

    //setPlayerMove(playerMovementTop[cameraStateIndex]);
    // console.log('csi',  direction);
  }, [cameraStateIndex, gravityDirection]);

  useEffect(() => {
    const playerRotation = player.current?.rotation;

    const eulerRotation = new THREE.Euler(
      0,
      Math.round(player.current.rotation.y),
      0
    );
    const quaternionRotation = new THREE.Quaternion().setFromEuler(
      eulerRotation
    );

    // console.log('Player Rotation:', playerRotation);
    // console.log('Player Rotation U:', eulerRotation);
    // console.log('Forward Direction:', quaternionRotation);
  }, [camPosition]);



  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------



  // if(arraysMatch(gravityDirection,gravityDirectionDict.top)){
  //   setCamPosition(cameraDirectionsTop[cameraStateIndex]);
  // }else if(arraysMatch(gravityDirection,gravityDirectionDict.back)){

  // const newDirection = new THREE.Vector3(0, 1, 0); // Replace this with your desired direction
  // setLivePlayerDirection(newDirection)
  //  //setCamPosition(cameraDirectionsBack[cameraStateIndex]);
  // }else if(arraysMatch(gravityDirection,gravityDirectionDict.front)){
  // // setCamPosition(cameraDirectionsFront[cameraStateIndex]);

  // }

  // console.log('GDN',gravityDirection)
  // console.log('GDN',livePlayerDirection)

  const setPlayerMove = useCallback(() => {

    console.log('moving',hasHitWall);

    // if (hasHitWall) {
    //   setHasHitWall(false)
    // }
      //console.log("LPD player move", lpd);
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
      setBodyPosition(newPosition)
      body.current.setTranslation(newPosition);
      checkCollisionsBelow();


  }, []);





  const turnPlayerLeft = () => {
    setMovementState(MovementState.MOVE_RIGHT);
    setCameraStateIndex((prevIndex) => (prevIndex + 1 + 4) % 4);
    //player.current.rotation.y += Math.PI / 2; // Rotate by 90 degrees

    gsap.to(player.current.rotation, {
      duration: 0.3, // Adjust the duration for the desired speed
      y: "+=" + Math.PI / 2,
      ease: "linear", // Use linear easing for uniform speed
      // onComplete: () => {
      //   isPlayerMoving = false;
      // },
    });
  };



  const turnPlayerRight = () => {
    setMovementState(MovementState.MOVE_RIGHT);
    setCameraStateIndex((prevIndex) => (prevIndex - 1 + 4) % 4);
    player.current.rotation.y -= Math.PI / 2; // Rotate by 90 degrees

    // gsap.to(player.current.rotation, {
    //   duration: 0.3, // Adjust the duration for the desired speed
    //   y: "-=" + Math.PI / 2,

    //   ease: "linear", // Use linear easing for uniform speed
    //   // onComplete: () => {
    //   //   isPlayerMoving = false;
    //   // },
    // });
  };



  const turmPlayerUp = () => {
  //  console.log(player.current.rotation)
    gsap.to(player.current.rotation, {
      duration: 1.0, // Adjust the duration for the desired speed
      x:  "+=" + Math.PI / 2,

      ease: "linear", // Use linear easing for uniform speed
      // onComplete: () => {
      //   isPlayerMoving = false;
      // },
    });
  };

  const turmPlayerDown = () => {
    gsap.to(player.current.rotation, {
      duration: 1.0, // Adjust the duration for the desired speed
      x:  "-=" + Math.PI / 2,

      ease: "linear", // Use linear easing for uniform speed
      // onComplete: () => {
      //   isPlayerMoving = false;
      // },
    });
  };






  const jump = useCallback(() => {

    const playerRotation = player.current.rotation.clone();
    const impulseDirection = new THREE.Vector3(0, 1, 0);
    impulseDirection.applyQuaternion(new THREE.Quaternion().setFromEuler(playerRotation));

    const impulseStrength = 20; // Adjust the strength of the impulse as needed
    body.current.applyImpulse({
      x: impulseDirection.x * impulseStrength,
      y: impulseDirection.y * impulseStrength,
      z: impulseDirection.z * impulseStrength,
    });
 
  }, []);

  const reset = () => {
    console.log("reset");
  };







  const handleContinuousMovement = useCallback(() => {
    if (isKeyPressed && movementState === MovementState.FORWARD) {
      setPlayerMove();
    }
  }, [isKeyPressed, movementState]);

  function getReverseGravityDirectionOnHit(roundedVector) {
    const newGravityDirection = {
      x: roundedVector.x >= 0 ? -roundedVector.x : roundedVector.x,
      y: roundedVector.y >= 0 ? -roundedVector.y : roundedVector.y,
      z: roundedVector.z >= 0 ? -roundedVector.z : roundedVector.z,
    };
    return newGravityDirection;
  }





  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------

  const color = useControls({
    directional_color: "#00ff9f",
    ambient_color: "#7600ff",
  });

  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------




// useEffect(() => {


//   // Reset the hasHitWall state when the player starts moving forward again
//   if (movementState === MovementState.FORWARD) {
//     setHasHitWall(false);
//     console.log('movement state',hasHitWall)
//   }
// }, [movementState]);

// useEffect(() => {
//   // Reset the hasHitWall state when the player starts moving forward again
//  console.log('hasHiwall', hasHitWall)
// }, [hasHitWall]);




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
         // console.log("direction:", livePlayerDirection);

        }
      }
    );

    const unsubscribeLeft = subscribeKeys(
      (state) => state.leftward,
      (value) => {
        if (value) {
          turnPlayerLeft();
        }
      }
    );

    const unsubscribeRight = subscribeKeys(
      (state) => state.rightward,
      (value) => {
        if (value) {
          turnPlayerRight();
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

  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------

  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------


  const handleEdgeCollision = () => {
    gsap.to(player.current.rotation, {
      duration: 0.3,
      x: "-=" + Math.PI / 2,
      ease: "linear",
    })

    const gravityUp = new THREE.Vector3(...gravityDirection);
    const angle = Math.PI / 2; // 90 degrees in radians
    gravityUp.applyAxisAngle(new THREE.Vector3(1, 0, 0), angle);
    // Rotate the gravity direction according to the player's rotation
    const rotatedGravity = gravityUp.clone().applyQuaternion(player.current?.quaternion);


    
    // Set the local gravity direction based on the rotated gravity
    setGravityDirection(rotatedGravity);
    console.log(gravityDirection,rotatedGravity)
    // Rotate the player mesh by 90 degrees

  }


  const handleWallCollision = () => {
    if (!hasHitWall) {




      gsap.to(player.current.rotation, {
        duration: 0.3,
        x: "+=" + Math.PI / 2,
        ease: "linear",
      })


      const gravityUp = new THREE.Vector3(...gravityDirection);
      const angle = Math.PI / 2; // 90 degrees in radians
      gravityUp.applyAxisAngle(new THREE.Vector3(1, 0, 0), angle);
      // Rotate the gravity direction according to the player's rotation
      const rotatedGravity = gravityUp.clone().applyQuaternion(player.current?.quaternion);

  
      
      // Set the local gravity direction based on the rotated gravity
      setGravityDirection(rotatedGravity);
      console.log(gravityDirection,rotatedGravity)
      // Rotate the player mesh by 90 degrees

      
      // const rotatedGravityDirection = gravityDirection.clone().applyEuler(player.current.rotation);

      // // Set the new gravity direction
      // setGravityDirection([rotatedGravityDirection.x, rotatedGravityDirection.y, rotatedGravityDirection.z]);

      
      // Set hasHitWall to true to prevent triggering again until the player starts moving forward
      setHasHitWall(true);
    }
  };
  


// Call this function wherever you want to check for collisions below the player



const { scene } = useThree();

  
const checkCollisionsBelow = () => {

  const currentPosition = body.current?.translation();
  const newPosition = new THREE.Vector3(currentPosition.x, currentPosition.y, currentPosition.z);

  // Check if playerPosition is defined
  if (!currentPosition) {
    console.error('Player position is not defined.');
    return;
  }

    const raycasterOffset = new THREE.Vector3(0, 0, 0);
    raycasterDown.set(newPosition.clone().add(raycasterOffset), gravityDirection);


     
    // Set the raycaster direction in the local coordinate system (forward direction along positive z-axis)
    const rayFDirection = new THREE.Vector3(0, 0, -1);
    rayFDirection.applyAxisAngle(new THREE.Vector3(1, 0, 0), player.current.rotation.x);
    rayFDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), player.current.rotation.y);
    rayFDirection.applyAxisAngle(new THREE.Vector3(0, 0, 1), player.current.rotation.z);

    raycasterForward.set(newPosition.clone().add(raycasterOffset), rayFDirection);



  
   const intersects = raycasterDown.intersectObjects(objp, true);
   const intersectsForward = raycasterForward.intersectObjects(objp, true);



  if (intersects.length > 0) {
    console.log('Collision below!', raycasterDown.ray.direction);

    intersects.forEach((intersection, index) => {
 
      console.log('Object:', intersection.object.uuid); // Log details about the intersected object
      console.log(newPosition)
      
      const object = intersection.object;
      const originalMaterial = object.material;

      // Change the material to a highlighted material
      const highlightedMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      object.material = highlightedMaterial;

      // Optionally, set a timeout to revert the material back after a certain time
   
    });



  } else {

    console.log('----------No collision below.',raycasterDown.ray.direction);
   // handleEdgeCollision();
    // gsap.to(player.current.rotation, {
    //   duration: 0.3,
    //   x: "-=" + Math.PI / 2,
    //   ease: "linear",
    // })
  }

  if (intersectsForward.length > 0) {
    console.log('Collision front!', raycasterForward.ray.direction);

    intersects.forEach((intersection, index) => {
 
      console.log('Object:', intersection.object.uuid); // Log details about the intersected object
      console.log(newPosition)
      
      const object = intersection.object;
      const originalMaterial = object.material;

      // Change the material to a highlighted material
      const highlightedMaterial = new THREE.MeshBasicMaterial({ color: 'pink' });
      object.material = highlightedMaterial;

      // Optionally, set a timeout to revert the material back after a certain time
      handleWallCollision();

    });
  } else {

    console.log('----------No collision infront.',raycasterForward.ray.direction);

    // gsap.to(player.current.rotation, {
    //   duration: 0.3,
    //   x: "-=" + Math.PI / 2,
    //   ease: "linear",
    // })
  }
};








  useFrame((state, delta) => {
    const { forward, leftward, rightward } = getKeys();
    const playerPosition = player.current?.position;


    const bodyPosition = body.current?.translation();

    const { x: camPosX, y: camPosY, z: camPosZ } = camPosition;

    const currentPosition = body.current?.translation();

    const newPosition = {
      x: currentPosition.x,
      y: currentPosition.y,
      z: currentPosition.z,
    };



    // Set the raycaster's origin to the player's position
//    raycasterDown.set(playerPosition, new THREE.Vector3(0, -1, 0));
  
    // Perform the raycast
    // const intersects = raycasterDown.intersectObjects(blockPositions, true);
    //const intersects = raycasterDown.intersectObjects(blockPositions)

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
  
      
      // if (intersects) {
      //   // Handle facing down
      //   console.log("Intersects");
      // }

      // if (isFacingDown) {
      //   // Handle facing down
      //   console.log("Facing down!");
      // }
  
      // if (intersects) {
      //   // Handle facing forward
      //   console.log("Facing forward!");
      // }





    // const roundedForwardDirection = getRoundedVector2(newPosition)
    // setLivePlayerDirection(roundedForwardDirection);
    // console.log('move dir L',livePlayerDirection)

    if (playerPosition) {


      if (forward) {
        setIsKeyPressed(true);
        setMovementState(MovementState.FORWARD);

        //console.log('PP:',newPosition)
        const isAtFloorEdge = newPosition.y <= 0;
        
        const playerFrontPosition = new THREE.Vector3(
          newPosition.x,
          0,
          newPosition.z
        ); // Assuming the floor is at y = 0

        // console.log('PFP:',playerFrontPosition)
        // console.log('GDD:',gravityDirection)

        //console.log("pos t", body.current.translation());

        const blockWidthThreshold = 1.5; // Set a threshold for proximity to the block




        checkCollisionsBelow();



        // const isFacingBlock = blockPositions.some((blockPosition) => {
          
        //   const roundedNewPosition = getRoundedVector(newPosition);
        //   const roundedBlockPosition = getRoundedVector(blockPosition);
  
        //   const distanceToBlock = new THREE.Vector2(
        //     roundedNewPosition.x - roundedBlockPosition.x,
        //     roundedNewPosition.z - roundedBlockPosition.z
        //   ).length();

  
        //   const isAtExactPositionForward = distanceToBlock < blockWidthThreshold && roundedNewPosition.y === roundedBlockPosition.y;
        //   if (isAtExactPositionForward) {
        //     // Trigger rotation and gravity direction change
        //     handleWallCollision();
        //   }
        


        //   const isAtExactPositionDown = distanceToBlock < blockWidthThreshold && roundedNewPosition.y >= roundedBlockPosition.y;
        //   if (!isAtExactPositionDown) {
        //     console.log('DOWN')
        //   }

        //   return isAtExactPositionForward; 


          
        // });




        // if (isFacingBlock) {
        //   const forwardDirection = new THREE.Vector3(0, 0, -1);
        //   const forwardDirectionFront = new THREE.Vector3(0, 1, 0);

        //  // console.log("FUCK", forwardDirectionFront);
        //   lpd = forwardDirectionFront;
        //   setGravityDirection(gravityDirectionDict.back);
        //  // turmPlayerUp()


        // }

        //console.log(gravityDirection)

        // if (isAtFloorEdge) {
        //   console.log("Approaching floor edge!");
        //   //getNewGravityDirectionOnHit()
        //   // Handle approaching floor edge
        //   setGravityDirection(gravityDirectionDict.front);
        // }




      } else {
        setIsKeyPressed(false);
      }

      handleContinuousMovement();

      const myVector = new THREE.Vector3(
        bodyPosition.x,
        bodyPosition.y,
        bodyPosition.z
      );

      const cameraPosition = myVector
        .clone()
        .add(new THREE.Vector3(camPosX, camPosY, camPosZ));
      const cameraTarget = myVector.clone().add(new THREE.Vector3(0, 0.25, 0));

      // Use the cameraTarget variable in the following lines
      smoothedCameraPosition.lerp(cameraPosition, 5 * delta);
      smoothedCameraTarget.lerp(cameraTarget, 5 * delta);

      // Set camera position and look at the player
      state.camera.position.copy(smoothedCameraPosition);
      state.camera.lookAt(smoothedCameraTarget);
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

      type=""
      colliders="ball"
      ref={body}
      position={[0, 1, 0]}
      lockTranslations={[true,false,false]}
      lockRotations={true}
      mass={10}
      restitution={0.001}
      friction={10}
        enabledRotation={[false,false,false]}
    >
      <mesh ref={player}>
        <boxGeometry />

      </mesh>
    </RigidBody>

  );
}
