import * as THREE from "three";
import { useRapier, RigidBody } from "@react-three/rapier"; // Correct import for Quat and Euler
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { useEffect, useCallback, useRef, useState } from "react";
import useGame from "./stores/useGame.jsx";
import { gsap } from "gsap";
import { useThree } from "@react-three/fiber";
import { PerspectiveCamera,  Euler, Quaternion,  Spherical, Vector3} from "three";

import { useControls } from "leva";

const directionMap = {
  0: "forward",
  1: "left",
  2: "back",
  3: "right",
};

export default function Player({ blocks, positions, objects }) {
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
  const [playerPosition, setPlayerPosition] = useState(
    new THREE.Vector3(0, 0, 0)
  );

  const [cameraStateIndex, setCameraStateIndex] = useState(0);
  const [livePlayerDirection, setLivePlayerDirection] = useState(
    new THREE.Vector3(0, 0, -1)
  );
  var lpd = new THREE.Vector3(0, 0, -1);

  //set cam back

  const [hasHitWall, setHasHitWall] = useState(false);
  const [hasHitEdge, setHasHitEdge] = useState(false);
  const [isPlayerMoving, setIsPlayerMoving] = useState(false);

  const start = useGame((state) => state.start);
  const end = useGame((state) => state.end);
  const restart = useGame((state) => state.restart);

  const [subscribeKeys, getKeys] = useKeyboardControls();
  const [isKeyPressed, setIsKeyPressed] = useState(false);

  const { rapier, world } = useRapier();
  const body = useRef();
  const player = useRef();
  const cameraRef = useRef();
  const group = useRef();





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


  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------

  const setPlayerMove = useCallback(() => {
    console.log("moving", hasHitWall);
    setIsPlayerMoving(true);
    isExecuted = true;

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

    //checkCollisions();
    setIsPlayerMoving(false);
  }, []);



  const turnPlayerLeft = () => {
    if (!isPlayerMoving) {
      setIsPlayerMoving(true);
      const currentRotation = group.current.rotation.y;
      const targetRotation =
        Math.round(currentRotation / (Math.PI / 2)) * (Math.PI / 2) +
        Math.PI / 2;
      gsap.to(group.current.rotation, {
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
      const currentRotation = group.current.rotation.y;
      const targetRotation =
        Math.round(currentRotation / (Math.PI / 2)) * (Math.PI / 2) -
        Math.PI / 2;
      gsap.to(group.current.rotation, {
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
    if (!isExecuted) {
        // Get the current Euler rotation of the group
        const currentRotation = group.current.rotation.clone();

        // Calculate the new x rotation taking into account the current y rotation
        const targetRotationX = Math.round(currentRotation.x / (Math.PI / 2)) * (Math.PI / 2) + Math.PI / 2;
        
        // Calculate the new y rotation (no change in this case)
        const targetRotationY = currentRotation.y;

        // Apply the new rotation
        gsap.to(group.current.rotation, {
            duration: 0.3,
            x: targetRotationX,
            y: targetRotationY, // Maintain the current y rotation
            ease: "linear",
            onComplete: () => {
                updatePlayerUpDirection();
            },
        });
    }
};

  const turnPlayerDown = () => {
    // if (!isPlayerMoving) {
    //   setIsPlayerMoving(true);
    // }          setIsPlayerMoving(false);

    if (!isExecuted) {

          const currentRotation = group.current.rotation.x;
          const targetRotation = Math.round(currentRotation / (Math.PI / 2)) * (Math.PI / 2) - Math.PI / 2;

          gsap.to(group.current.rotation, {
          duration: 0.3, // Adjust the duration for the desired speed
          x: targetRotation,
          ease: "linear", // Use linear easing for uniform speed
          onComplete: () => {
            //setIsPlayerMoving(false);
           // cameraRef.current.rotation.copy(player.current.rotation);
            updatePlayerUpDirection();
          //  isExecuted = true;
          },

      });
    }
  
  };

  const updatePlayerUpDirection = () => {
    // Calculate the up direction based on the player's current rotation
    const upDirection = new THREE.Vector3(0, 1, 0).applyQuaternion(
      player.current.quaternion
    );

    // Set the player's up direction to match the calculated up direction
    player.current.up.copy(upDirection);
  };

  const jump = useCallback(() => {
    const playerRotation = player.current.rotation.clone();
    const impulseDirection = new THREE.Vector3(0, 1, 0);
    impulseDirection.applyQuaternion(
      new THREE.Quaternion().setFromEuler(playerRotation)
    );

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
      console.log("hcm");
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
                    turnPlayerUp();
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




  const handleEdgeCollision = () => {
    gsap.to(player.current.rotation, {
      duration: 0.3,
      x: "-=" + Math.PI / 2,
      ease: "linear",
    });

    
    // const gravityUp = new THREE.Vector3(...gravityDirection);
    // const angle = Math.PI / 2; // 90 degrees in radians
    //gravityUp.applyAxisAngle(new THREE.Vector3(1, 0, 0), angle);

    // Rotate the gravity direction according to the player's rotation
    // const rotatedGravity = gravityUp
    //   .clone()
    //   .applyQuaternion(player.current?.quaternion);

    console.log('EDGE-==================');

    // Set the local gravity direction based on the rotated gravity
    //setGravityDirection(rotatedGravity);
    //console.log(gravityDirection,rotatedGravity)
    // Rotate the player mesh by 90 degrees
  };

  const handleWallCollision = () => {
    if (!hasHitWall) {
      //--use gravity vec  with euler
      gsap.to(player.current.rotation, {
        duration: 0.3,
        x: "+=" + Math.PI / 2,
        ease: "linear",
      });

      const gravityUp = new THREE.Vector3(...gravityDirection);
      const angle = Math.PI / 2; // 90 degrees in radians
      gravityUp.applyAxisAngle(new THREE.Vector3(1, 0, 0), angle);
      // Rotate the gravity direction according to the player's rotation
      const rotatedGravity = gravityUp
        .clone()
        .applyQuaternion(player.current?.quaternion);

      // ---separate this---- Set the local gravity direction based on the rotated gravity
      setGravityDirection(rotatedGravity);
      // console.log(gravityDirection,rotatedGravity)
      // Rotate the player mesh by 90 degrees

      // Set hasHitWall to true to prevent triggering again until the player starts moving forward
      setHasHitWall(true);
    }
  };

  // Call this function wherever you want to check for collisions below the player

  // const raycasterForward = new THREE.Raycaster();
  // const raycasterDown = new THREE.Raycaster();



  const [raycasterForward, setRaycasterForward] = useState(new THREE.Vector3(0, 0, -1));
  const [raycasterDown, setRaycasterDown] = useState(new THREE.Vector3(0, -1, 0));
  
  raycasterDown.far = 10; // Set the far property to an appropriate value
  raycasterForward.far = 10; // Set the far property to an appropriate value



  const checkCollisions = (player) => {

    const currentPosition = player.current?.position;
    const currentRotation = player.current?.rotation;

    const newPosition = new THREE.Vector3(
      currentPosition.x,
      currentPosition.y,
      currentPosition.z
    );

    // Check if playerPosition is defined
    if (!currentPosition) {
      console.error("Player position is not defined.");
      return;
    }

    const raycasterOffset = new THREE.Vector3(0, 0, 0);

    raycasterDown.set(
      newPosition.clone().add(raycasterOffset),
      currentRotation
    );

    // Set the raycaster direction in the local coordinate system (forward direction along positive z-axis)
    const rayFDirection = new THREE.Vector3();

    rayFDirection.applyAxisAngle(
      new THREE.Vector3(1, 0, 0),
      player.current.rotation.x
    );
    rayFDirection.applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      player.current.rotation.y
    );
    rayFDirection.applyAxisAngle(
      new THREE.Vector3(0, 0, 1),
      player.current.rotation.z
    );

    raycasterForward.set(
      newPosition.clone().add(raycasterOffset),
      rayFDirection
    );


  



    const intersects = raycasterDown.intersectObjects(objp, true);
    const intersectsForward = raycasterForward.intersectObjects(objp, true);

    if (intersects.length > 0) {
      console.log("Collision below!", raycasterDown.ray.direction);

      intersects.forEach((intersection, index) => {
        //console.log('Object:', intersection.object.uuid); // Log details about the intersected object
        //console.log(newPosition)

        const object = intersection.object;
        const originalMaterial = object.material;

        // Change the material to a highlighted material
        const highlightedMaterial = new THREE.MeshBasicMaterial({
          color: 0xff0000,
        });
        object.material = highlightedMaterial;

        // Optionally, set a timeout to revert the material back after a certain time
      });
    } else {
      console.log("----------No collision below.", raycasterDown.ray.direction);
      //  handleEdgeCollision();
      //   gsap.to(player.current.rotation, {
      //     duration: 0.3,
      //     x: "-=" + Math.PI / 2,
      //     ease: "linear",
      //   })
    }

    if (intersectsForward.length > 0) {
      console.log("Collision front!", raycasterForward.ray.direction);

      intersects.forEach((intersection, index) => {
        console.log("Object:", intersection.object.uuid); // Log details about the intersected object
        console.log(newPosition);

        const object = intersection.object;
        const originalMaterial = object.material;

        // Change the material to a highlighted material
        const highlightedMaterial = new THREE.MeshBasicMaterial({
          color: "pink",
        });
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





  const { playerposition, playerrotation } = useControls({
    position: {
      value: [0, 0, 0], // Initial position
      min: [-10, -10, -10], // Minimum values for each axis
      max: [10, 10, 10], // Maximum values for each axis
      step: 0.1, // Step size for each axis
      onChange: (value) => {
        // Update the position of the player mesh
        group.current.position.set(...value);
      },
    },
    rotation: {
      value: [0, 0, 0], // Initial rotation (in radians)
      // min: [-Math.PI, -Math.PI, -Math.PI], // Minimum rotations for each axis
      // max: [Math.PI, Math.PI, Math.PI], // Maximum rotations for each axis
      step: 0.01, // Step size for each axis
      onChange: (value) => {
        // Create an Euler object from the rotation values
        const euler = new Euler(...value, 'ZYX'); // Set the Euler order here as well
        // Create a Quaternion and set it from the Euler object
        const quaternion = new Quaternion().setFromEuler(euler);
        // Apply the quaternion to the player's rotation
        group.current.quaternion.copy(quaternion);


      }
    },
  });



    // rotation: {
    //   value: initialRotation, // Initial rotation from the quaternion
    //   min: [-Math.PI, -Math.PI, -Math.PI], // Minimum rotations for each axis
    //   max: [Math.PI, Math.PI, Math.PI], // Maximum rotations for each axis
    //   step: 0.01, // Step size for each axis
    //   onChange: (value) => {
    //     // Create an Euler object from the rotation values
    //     const euler = new THREE.Euler(...value);
    //     // Create a Quaternion and set it from the Euler object
    //     const quaternion = new THREE.Quaternion().setFromEuler(euler);
    //     // Apply the quaternion to the player's rotation
    //     player.current.quaternion.copy(quaternion);
    //   },
    // },

    // Initial player position
    const initialPosition = new THREE.Vector3(0, 0, 0);

    useEffect(() => {
      if (player.current) {
        player.current.position.copy(initialPosition);
      }
      if (body.current) {
        body.current.setTranslation(initialPosition, true);
      }
    }, []);


    var isExecuted = false;




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
       // setPlayerMove();
      }


  

      // if (group.current && state.camera) {
      //     //console.log(player.current.getWorldPosition(prevPosition.current));

      //   const oldPosition = new THREE.Vector3(playerPosition);
      //   // player.current.position.x += 0.01;

      //   const rotationSpeed = Math.PI / 180; // Convert degrees to radians
      //   // player.current.rotation.y += rotationSpeed;
      //   // player.current.rotation.x += rotationSpeed;

      //   const newPosition = new THREE.Vector3();
      //   group.current.getWorldPosition(newPosition);

      //   // Calculate the player's orientation quaternion
      //   const playerQuaternion = new THREE.Quaternion();
      //   playerQuaternion.setFromEuler(group.current.rotation);

      //   // Calculate the delta
      //   const delta = newPosition.clone().sub(oldPosition);

      //   // Adjust the camera position
      //   const offset = new THREE.Vector3(0, 1.5, 4); // Offset behind and slightly above the player
      //   offset.applyEuler(group.current.rotation);
      //   //offset.applyQuaternion(playerQuaternion);

      //   const cameraPosition = newPosition.clone().add(offset);

      //   const easingFactor = 0.5;
      //   state.camera.position.lerp(cameraPosition, easingFactor);
      //   state.camera.lookAt(newPosition);

      //   //Calculate camera orientation
      //   const lookAtPosition = playerPosition.clone();
      //   const lookDirection = lookAtPosition.clone().sub(cameraPosition).normalize();
      //   const upDirection = new THREE.Vector3(0, 1, 0); // Up direction
      //   const cameraQuaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, -1), lookDirection);
      //   state.camera.quaternion.copy(cameraQuaternion);

      //   const groupUpDirection = new THREE.Vector3(0, 1, 0);
      //   groupUpDirection.applyQuaternion(group.current.quaternion);
      //   state.camera.up.copy(groupUpDirection);

        
      //   //Optionally, update the camera reference to be used in future calculations
      // }



      if (group.current && state.camera) {
        // Update player's position and rotation
        const newPosition = new THREE.Vector3();
        group.current.getWorldPosition(newPosition);
  
        // Update camera position
        const offset = new THREE.Vector3(0, 1.5, 4); // Offset behind and slightly above the player
        offset.applyQuaternion(group.current.quaternion);
        const cameraPosition = newPosition.clone().add(offset);
        state.camera.position.copy(cameraPosition);
  
        // Update camera orientation
        const lookAtPosition = playerPosition.clone();
        state.camera.lookAt(lookAtPosition);
  
        // Set camera up direction to match group's up direction
        const groupUpDirection = new THREE.Vector3(0, 1, 0);
        groupUpDirection.applyQuaternion(group.current.quaternion);
        state.camera.up.copy(groupUpDirection);
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
      
         // Update arrow helpers for raycasters
          const dir = new THREE.Vector3(0, 0, -1);
          dir.normalize();
          const origin = new THREE.Vector3( 0, 0, 0 );
          const length = 1;
          const hex = 0x000000;
          
          const arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
          player.current.add( arrowHelper );


          const dir2 = new THREE.Vector3(0, -1, 0);
          dir2.normalize();
          const origin2 = new THREE.Vector3( 0, 0, 0 );
          const length2 = 1;
          const hex2 = 0xff0000;
          
          const arrowHelper2 = new THREE.ArrowHelper( dir2, origin2, length2, hex2 );
          player.current.add( arrowHelper2 );




        const rayFDirection = dir; // Forward direction
        const rayDDirection = dir2; // Down direction
        const raycasterOffset = new THREE.Vector3(0, 0, 0);
        const rayDPosition = player.current.position;

        raycasterDown.set(
          rayDPosition.clone().add(raycasterOffset),
        rayDDirection
        );

            const origin3 = new THREE.Vector3( 0, 0, 0 );
            const length3 = 1;
            const hex3 = 0xff0000;
            
            const arrowHelperRay = new THREE.ArrowHelper( dir2, origin3, length3, hex3 );
            player.current.add( arrowHelper2 );


          //  const intersectsDown = raycasterDown.intersectObjects(objp, true);
          //  if (intersectsDown.length > 0) {
          //   console.log("Collision below!", raycasterDown.ray.direction);

          //   intersectsDown.forEach((intersection, index) => {
          //     //console.log('Object:', intersection.object.uuid); // Log details about the intersected object
          //     //console.log(newPosition)
      
          //     const object = intersection.object;
          //     const originalMaterial = object.material;
      
          //     // Change the material to a highlighted material
          //     const highlightedMaterial = new THREE.MeshBasicMaterial({
          //       color: 0xff0000,
          //     });
          //     object.material = highlightedMaterial;
      
          //     // Optionally, set a timeout to revert the material back after a certain time
          //   });

          //  }else{
          //   turnPlayerUp();
          //  }
          // const intersectsForward = raycasterForward.intersectObjects(objp, true);


    }
  });


  const ArrowHelper = ({ direction, color = 0x000000 }) => {
    const origin = new THREE.Vector3(0, 0, 0);
    const length = 2;
  
    return <primitive object={<THREE.ArrowHelper dir={direction} origin={origin} length={length} color={color} />} />;
  };

  

  return (
    <>
      <RigidBody
        enabledRotations={[false, true, true]}
        type="static"
        colliders="cuboid"
        ref={body}
        position={[0, 3, 6]}
        // position={player.current.position.toArray()} // Set position to player's position
        // rotation={player.current.rotation.toArray()}
        // lockTranslations={[true,true,true]}
        // lockRotations={[true,true,true]}
        mass={1}
        restitution={0}
        friction={0}
      ></RigidBody>


      <group ref={group}>
          <mesh ref={player} >
          <meshPhongMaterial color="#ff0000" opacity={0.1} transparent />
          <boxGeometry />
          </mesh>
          <perspectiveCamera ref={cameraRef} position={[0, 0, 0]} /> {/* Ensure the camera is initially positioned inside the group */}

      </group>

    </>
  );
}
