import * as THREE from "three";
import {
  useRapier,
  RigidBody,
} from "@react-three/rapier"; // Correct import for Quat and Euler
import { useFrame } from "@react-three/fiber";
import {
  useKeyboardControls,
} from "@react-three/drei";
import { useEffect, useCallback, useRef, useState } from "react";
import useGame from "./stores/useGame.jsx";
import { gsap } from "gsap";
import { useThree } from '@react-three/fiber'
import { PerspectiveCamera } from "three";

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
  const [bodyPosition, setBodyPosition] = useState(new THREE.Vector3(0, 0, 0));
  const [playerPosition, setPlayerPosition] = useState(new THREE.Vector3(0, 0, 0));

  const [cameraStateIndex, setCameraStateIndex] = useState(0);
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
  const [hasHitEdge, setHasHitEdge] = useState(false);
  const [isPlayerMoving, setIsPlayerMoving] = useState(false);



  const raycasterForward = new THREE.Raycaster();

  const raycasterDown = new THREE.Raycaster();
  raycasterDown.far = 1; // Set the far property to an appropriate value
  raycasterForward.far = 2; // Set the far property to an appropriate value

  const start = useGame((state) => state.start);
  const end = useGame((state) => state.end);
  const restart = useGame((state) => state.restart);

  const [subscribeKeys, getKeys] = useKeyboardControls();
  const [isKeyPressed, setIsKeyPressed] = useState(false);

  const { rapier, world } = useRapier();
  const body = useRef();
  const player = useRef();
  const cameraRef = useRef();

  const transformControls = useRef();


  const dist = 5;



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
  }, [player.position,player.rotation]);




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
    // Array to store merged Vector3 values
    const mergedPositions = [];
    // Loop through positions and merge into a single array
    positions.forEach((position) => {
      const vector3 = new THREE.Vector3(position[0], position[1], position[2]);
      mergedPositions.push(vector3);
    });

    setBlockPositions(mergedPositions);
  }, [positions]);



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



  const setPlayerMove = useCallback(() => {

    console.log('moving',hasHitWall);
    setIsPlayerMoving(true);

    // if (hasHitWall) {
    //   setHasHitWall(false)
    // }
      //console.log("LPD player move", lpd);
      const moveDirection = new THREE.Vector3(0, 0, -1);
      moveDirection.applyQuaternion(player.current.quaternion).normalize();

      const moveDistance = 1; // Adjust the distance of movement as needed
      const moveSpeed = 0.1; // Adjust the speed of movement as needed

     // const currentPosition = body.current.translation();
      const currentPosition = player.current.position;
      
      
      const newPosition = {
        x: currentPosition.x + moveDirection.x * moveSpeed * moveDistance,
        y: currentPosition.y + moveDirection.y * moveSpeed * moveDistance,
        z: currentPosition.z + moveDirection.z * moveSpeed * moveDistance,
      };
      
   
      
      //body.current.setTranslation(newPosition);
      player.current.position.copy(newPosition);

      checkCollisionsBelow();
      setIsPlayerMoving(false);


  }, []);



  const turnPlayerLeft = () => {
    if (!isPlayerMoving) {
      setIsPlayerMoving(true);
      const currentRotation = player.current.rotation.y;
      const targetRotation = Math.round(currentRotation / (Math.PI / 2)) * (Math.PI / 2) + (Math.PI / 2);
      gsap.to(player.current.rotation, {
        duration: 0.3, // Adjust the duration for the desired speed
        y: targetRotation,
        ease: "linear", // Use linear easing for uniform speed
        onComplete: () => {
          setIsPlayerMoving(false);
          updatePlayerUpDirection();
        },
      });
    }
  };
  
  const turnPlayerRight = () => {
    if (!isPlayerMoving) {
      setIsPlayerMoving(true);
      const currentRotation = player.current.rotation.y;
      const targetRotation = Math.round(currentRotation / (Math.PI / 2)) * (Math.PI / 2) - (Math.PI / 2);
      gsap.to(player.current.rotation, {
        duration: 0.3, // Adjust the duration for the desired speed
        y: targetRotation,
        ease: "linear", // Use linear easing for uniform speed
        onComplete: () => {
          setIsPlayerMoving(false);
          updatePlayerUpDirection();
        },
      });
    }
  };
  
  const turnPlayerUp = () => {
    if (!isPlayerMoving) {
      setIsPlayerMoving(true);
      const currentRotation = player.current.rotation.x;
      const targetRotation = Math.round(currentRotation / (Math.PI / 2)) * (Math.PI / 2) + (Math.PI / 2);
      gsap.to(player.current.rotation, {
        duration: 1.0, // Adjust the duration for the desired speed
        x: targetRotation,
        ease: "linear", // Use linear easing for uniform speed
        onComplete: () => {
          setIsPlayerMoving(false);
          updatePlayerUpDirection();
        },
      });
    }
  };
  
  const turnPlayerDown = () => {
    if (!isPlayerMoving) {
      setIsPlayerMoving(true);
      const currentRotation = player.current.rotation.x;
      const targetRotation = Math.round(currentRotation / (Math.PI / 2)) * (Math.PI / 2) - (Math.PI / 2);
      gsap.to(player.current.rotation, {
        duration: 1.0, // Adjust the duration for the desired speed
        x: targetRotation,
        ease: "linear", // Use linear easing for uniform speed
        onComplete: () => {
          setIsPlayerMoving(false);
          updatePlayerUpDirection();
        },
      });
    }
  };

  const updatePlayerUpDirection = () => {
    // Calculate the up direction based on the player's current rotation
    const upDirection = new THREE.Vector3(0, 1, 0).applyQuaternion(player.current.quaternion);
  
    // Set the player's up direction to match the calculated up direction
    player.current.up.copy(upDirection);
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
      console.log('hcm')
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
          turnPlayerDown();

          //setMovementState(MovementState.BACKWARD);
        }
      }
    );

    const unsubscribeForward = subscribeKeys(
      (state) => state.forward,
      (value) => {
        if (value) {
//          turnPlayerUp();
         // setPlayerMove()
          setMovementState(MovementState.FORWARD);
         console.log("direction:", livePlayerDirection);

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


      //--use gravity vec  with euler
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
      
      // ---separate this---- Set the local gravity direction based on the rotated gravity
      setGravityDirection(rotatedGravity);
     // console.log(gravityDirection,rotatedGravity)
      // Rotate the player mesh by 90 degrees

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
 
      //console.log('Object:', intersection.object.uuid); // Log details about the intersected object
      //console.log(newPosition)
      
      const object = intersection.object;
      const originalMaterial = object.material;

      // Change the material to a highlighted material
      const highlightedMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      object.material = highlightedMaterial;

      // Optionally, set a timeout to revert the material back after a certain time
   
    });



  } else {

    console.log('----------No collision below.',raycasterDown.ray.direction);
  //  handleEdgeCollision();
  //   gsap.to(player.current.rotation, {
  //     duration: 0.3,
  //     x: "-=" + Math.PI / 2,
  //     ease: "linear",
  //   })
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

    //console.log('----------No collision infront.',raycasterForward.ray.direction);

    // gsap.to(player.current.rotation, {
    //   duration: 0.3,
    //   x: "-=" + Math.PI / 2,
    //   ease: "linear",
    // })
  }
};




const updateCameraPosition = (delta) => {

  if (!body.current) return; // Ensure player is defined


};



const { bodyposition, bodyrotation } = useControls({
  position: {
    value: [0, 2, 0],
    min: [-10, -10, -10],
    max: [10, 10, 10],
    step: 0.1,
    onChange: (value) => {
      body.current.setTranslation(new THREE.Vector3(...value));
    },
  },
  rotation: {
    value: [0, 0, 0],
    min: [-Math.PI, -Math.PI, -Math.PI],
    max: [Math.PI, Math.PI, Math.PI],
    step: 0.01,
    onChange: (value) => {
      const [x, y, z] = value;
      const quaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z));
      body.current.setRotation(quaternion);
    },
  },
});


const { playerposition, playerrotation } = useControls({
  position: {
    value: [0, 0, 0], // Initial position
    min: [-10, -10, -10], // Minimum values for each axis
    max: [10, 10, 10], // Maximum values for each axis
    step: 0.1, // Step size for each axis
    onChange: (value) => {
      // Update the position of the player mesh
      player.current.position.set(...value);
    },
  },
  rotation: {
    value: [0, 0, 0], // Initial rotation (in radians)
    min: [-Math.PI, -Math.PI, -Math.PI], // Minimum rotations for each axis
    max: [Math.PI, Math.PI, Math.PI], // Maximum rotations for each axis
    step: 0.01, // Step size for each axis
    onChange: (value) => {
      // Update the rotation of the player mesh
      player.current.rotation.set(...value);
    },
  },
});



  useFrame((state, delta) => {
    const { forward, leftward, rightward } = getKeys();
    const playerPosition = player.current?.position;


    const bodyPosition = body.current?.translation();
    const { x: camPosX, y: camPosY, z: camPosZ } = camPosition;
    const currentPosition = body.current?.translation();



    if (playerPosition) {

     
      if (forward) {
        setMovementState(MovementState.FORWARD);
             // handleContinuousMovement();
              setPlayerMove();
        checkCollisionsBelow();
      } 

      if (player.current && state.camera) {
       //   console.log(player.current.getWorldPosition(prevPosition.current));
          
       const oldPosition = new THREE.Vector3(playerPosition);
      // player.current.position.x += 0.01;

      const rotationSpeed = Math.PI / 180; // Convert degrees to radians
      // player.current.rotation.y += rotationSpeed;
      // player.current.rotation.x += rotationSpeed;


       const newPosition = new THREE.Vector3();
       player.current.getWorldPosition(newPosition);


       // Calculate the player's orientation quaternion
      const playerQuaternion = new THREE.Quaternion();
      playerQuaternion.setFromEuler(player.current.rotation);

             // Calculate the delta
      const delta = newPosition.clone().sub(oldPosition);




      // Adjust the camera position
      const offset = new THREE.Vector3(0, 1.5, 4); // Offset behind and slightly above the player
            offset.applyEuler(player.current.rotation);
      //offset.applyQuaternion(playerQuaternion);

      const cameraPosition = newPosition.clone().add(offset);
      


      const easingFactor = 0.5;
      state.camera.position.lerp(cameraPosition, easingFactor);
      state.camera.lookAt(newPosition);

      // Calculate camera orientation
      // const lookAtPosition = playerPosition.clone();
      // const lookDirection = lookAtPosition.clone().sub(cameraPosition).normalize();
      // const upDirection = new THREE.Vector3(0, 1, 0); // Up direction
      // const cameraQuaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, -1), lookDirection);
       //state.camera.quaternion.copy(cameraQuaternion);


      // Optionally, update the camera reference to be used in future calculations
      
      }


      // const myVector = new THREE.Vector3(
      //   bodyPosition.x,
      //   bodyPosition.y,
      //   bodyPosition.z
      // );

      // // Create a quaternion from the player's rotation (assuming body.current.rotation is available)
      // const playerQuaternion = new THREE.Quaternion();
      // if (body.current.rotation) {
      //   playerQuaternion.setFromEuler(new THREE.Euler(
      //     body.current.rotation.x, 
      //     body.current.rotation.y, 
      //     body.current.rotation.z));
      // }

      // // Define the offset
      // const offset = new THREE.Vector3(camPosX, camPosY, camPosZ);
      // offset.applyQuaternion(playerQuaternion);
      
      // const cameraPosition = myVector.clone().add(offset);
      // const cameraTarget = myVector.clone().add(new THREE.Vector3(0, 0.5, 0));

      // // Use the cameraTarget variable in the following lines
      // smoothedCameraPosition.lerp(cameraPosition, 5 * delta);
      // smoothedCameraTarget.lerp(cameraTarget, 5 * delta);

      // // Set camera position and look at the player
      // state.camera.position.copy(smoothedCameraPosition);
      // state.camera.lookAt(smoothedCameraTarget);
    }

  
  });

  return (
 
<>
    <RigidBody
         enabledRotations={[false, true, true]}

      type="static"
      colliders="cuboid"
      ref={body}
      position={[0,3,6]}
      // position={player.current.position.toArray()} // Set position to player's position
      // rotation={player.current.rotation.toArray()}
      // lockTranslations={[true,true,true]}
      // lockRotations={[true,true,true]}
      mass={1}
      restitution={0}
      friction={0}
    >

    </RigidBody>
    <mesh ref={player}>
        <perspectiveCamera ref={cameraRef} position={[0, -3, -3]} />
        <boxGeometry  />

      </mesh>
    </>
  );
}
