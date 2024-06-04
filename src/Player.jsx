import * as THREE from "three";
import { useRapier, RigidBody } from "@react-three/rapier"; // Correct import for Quat and Euler
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls, PivotControls } from "@react-three/drei";
import { useEffect, useCallback, useRef, useState, useMemo } from "react";
import useGame from "./stores/useGame.jsx";
import { gsap } from "gsap";
import { useThree } from "@react-three/fiber";
import {
  PerspectiveCamera,
  Euler,
  Quaternion,
  Spherical,
  Vector3,
} from "three";

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

  const updatePlayerUpDirection = () => {
    // Set the new up direction to be negative Y-axis
    group.current.up.set(0, 1, 0);  // Assuming the negative Y-axis is down
    console.log("Player up direction updated.");
  };


  const setPlayerMove = useCallback(() => {
    //    console.log("moving", hasHitWall);
    setIsPlayerMoving(true);
    //    isExecuted = true;

    // if (hasHitWall) {
    //   setHasHitWall(false)
    // }
    //console.log("LPD player move", lpd);
    const moveDirection = new THREE.Vector3(0, 0, -1);
    moveDirection.applyQuaternion(group.current.quaternion).normalize();

    const moveDistance = 1; // Adjust the distance of movement as needed
    const moveSpeed = 0.1; // Adjust the speed of movement as needed

    // const currentPosition = body.current.translation();
    const currentPosition = group.current.position;

    const newPosition = {
      x: currentPosition.x + moveDirection.x * moveSpeed * moveDistance,
      y: currentPosition.y + moveDirection.y * moveSpeed * moveDistance,
      z: currentPosition.z + moveDirection.z * moveSpeed * moveDistance,
    };

    //body.current.setTranslation(newPosition);
    group.current.position.copy(newPosition);

    //checkCollisions();
    setIsPlayerMoving(false);
  }, []);

  const isMultipleOfPi = (rotationAngle) => {
    // Round the rotation angle to one decimal place
    const roundedAngle = Math.round(rotationAngle * 10) / 10;

    // Check if the rounded angle is a multiple of π
    const multipleOfPi = Math.PI;

    // Tolerance to account for floating-point precision issues
    const tolerance = 0.1;

    return (
      Math.abs(roundedAngle % multipleOfPi) < tolerance ||
      Math.abs((roundedAngle % multipleOfPi) - multipleOfPi) < tolerance
    );
  };

  const turnPlayerLeft = () => {
    if (!isPlayerMoving) {
      setIsPlayerMoving(true);
      const currentRotation = group.current.rotation.y;
      const targetRotation =
        Math.round(currentRotation / (Math.PI / 2)) * (Math.PI / 2) +
        Math.PI / 2;

      group.current.rotateY(Math.PI / 2);

      // gsap.to(group.current.rotation, {
      //   duration: 0.3, // Adjust the duration for the desired speed
      //   y: targetRotation,
      //   ease: "linear", // Use linear easing for uniform speed
      //   onComplete: () => {

      //     console.log('IS LEFT OR RIGHT: ', isMultipleOfPi(targetRotation))

      //     setIsPlayerMoving(false);
      //     updatePlayerUpDirection();
      //   },
      // });
    }
  };

  const turnPlayerRight = () => {
    if (!isPlayerMoving) {
      setIsPlayerMoving(true);
      const currentRotation = group.current.rotation.y;
      const targetRotation =
        Math.round(currentRotation / (Math.PI / 2)) * (Math.PI / 2) -
        Math.PI / 2;

      group.current.rotateY(-(Math.PI / 2));

      // gsap.to(group.current.rotation, {
      //   duration: 0.3, // Adjust the duration for the desired speed
      //   y: targetRotation,
      //   ease: "linear", // Use linear easing for uniform speed
      //   onComplete: () => {

      //     console.log('IS LEFT OR RIGHT: ', isMultipleOfPi(targetRotation))

      //     setIsPlayerMoving(false);
      //     updatePlayerUpDirection();
      //   },
      // });
    }
  };

  const [rotationTarget, setRotationTarget] = useState(null);

  const turnPlayerUp = () => {
    if (!isExecuted) {
      // Get the current Euler rotation of the group
      const currentRotation = group.current.rotation.clone();

      const G = isMultipleOfPi(currentRotation.y);

      // Calculate the new x rotation taking into account the current y rotation
      const targetRotationX =
        Math.round(currentRotation.x / (Math.PI / 2)) * (Math.PI / 2) +
        Math.PI / 2;

      // Calculate the new y rotation (no change in this case)
      const targetRotationY = currentRotation.y;
      const targetRotationZ = currentRotation.z;

      group.current.rotateX(Math.PI / 2);
      // Apply the new rotation
      // gsap.to(group.current.rotation, {
      //     duration: 0.3,
      //     x: targetRotationX,

      //     ease: "linear",
      //     onComplete: () => {

      //       console.log('IS LEFT OR RIGHT: ', isMultipleOfPi(targetRotation))

      //         updatePlayerUpDirection();
      //     },
      // });
    }
  };

  const turnPlayerDown = () => {
    // Disable player movement
    setIsPlayerMoving(false);
  
 // Rotate the player by 90 degrees around the X-axis
 group.current.rotateX(-Math.PI / 2);

 // Ensure the quaternion is normalized
 group.current.quaternion.normalize();

 // Update the up direction
 //updatePlayerUpDirection();
  
    // Update the up direction of the player
   // updatePlayerUpDirection();
    group.current.up.set(0, 1, 0);  // Assuming the negative Y-axis is down

    console.log("Player rotated down and reset orientation.");
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

 

  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------

  const color = useControls({
    directional_color: "#00ff9f",
    ambient_color: "#7600ff",
  });

  const { yPosition } = useControls({
    yPosition: { value: 0, min: -10, max: 10, step: 0.1 }
  });

  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------


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
          setPlayerMove();
          setMovementState(MovementState.FORWARD);
          //console.log("direction:", livePlayerDirection);
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

  // Call this function wherever you want to check for collisions below the player

  const raycasterForward = new THREE.Raycaster();
  const raycasterDown = new THREE.Raycaster();
  const arrowHelperForward = useRef();
  const arrowHelperDown = useRef();
  raycasterDown.far = 5; // Set the far property to an appropriate value
  raycasterForward.far = 5; // Set the far property to an appropriate value

  useEffect(() => {
    if (group.current) {
      // Define and add arrow helpers
      const fdir = new THREE.Vector3(0, 0, -1).normalize();
      const origin = new THREE.Vector3(0, 0, 0);
      const length = 3;
      const hex = "hotpink";

      arrowHelperForward.current = new THREE.ArrowHelper(
        fdir,
        origin,
        length,
        hex
      );
      group.current.add(arrowHelperForward.current);

      const ddir = new THREE.Vector3(0, -1, 0).applyQuaternion(group.current.quaternion).normalize();
      const hex2 = "yellow";

      arrowHelperDown.current = new THREE.ArrowHelper(
        ddir,
        origin,
        length,
        hex2
      );
      group.current.add(arrowHelperDown.current);
    }

    // Add downward movement check after the initial setup

  }, []);

  const updateGroupRaycasters = () => {
    if (group.current) {
      // Update forward raycaster
      const forward = new THREE.Vector3(0, 0, -1)
        .applyQuaternion(group.current.quaternion)
        .normalize();
      const position = group.current.position.clone();
      const offset = new THREE.Vector3(0, 0, 0); // Adjust offset if necessary
  
      raycasterForward.set(position.add(offset), forward);
  
      // Update downward raycaster
      const downward = new THREE.Vector3(0, -1, 0)
        .applyQuaternion(group.current.quaternion)
        .normalize();
      raycasterDown.set(position.add(offset), downward);
  };
}


  
  const hightlightObjects = () => {
    const intersectsDown = raycasterDown.intersectObjects(objp, true);

    if (intersectsDown.length > 0) {
      intersectsDown.forEach((intersection, index) => {
        const closestIntersection = intersectsDown[0]; // Get the first (closest) intersection

        const object = closestIntersection.object;

       // const { object, faceIndex } = intersection;


        const originalMaterial = object.material;

        // Change the material to a highlighted material
        const highlightedMaterial = new THREE.MeshBasicMaterial({
          color: "blue",
        });
        object.material = highlightedMaterial;

        // Optionally, set a timeout to revert the material back after a certain time
      });

      // // Get the first intersection
      // const intersection = intersectsDown[0];
      // const intersectionPoint = intersection.point; // The point of intersection

      // // Adjust the intersection point by the player's height
      // const playerHeight = player.current.scale.y;
      // const adjustedY = intersectionPoint.y + playerHeight / 2;

      // // Output the intersection details
      // console.log("Intersection Point:", intersectionPoint);
      // console.log("Adjusted Player Y Position:", adjustedY);

      // Set the target position for smooth movement
    }
  };



  // Do this instead -- console.log( raycaster.ray.origin.distanceTo( intersects[0].point ) );

  const moveGroupDownIfIntersecting = () => {
    if (group.current) {
      // Update the raycaster direction to point downwards relative to the group
      const down = new THREE.Vector3(0, -1, 0)
        .applyQuaternion(group.current.quaternion);
  
      // Normalize the direction vector
      down.normalize();
  
      // Find the maximum absolute component value
      const maxComponent = Math.max(Math.abs(down.x), Math.abs(down.y), Math.abs(down.z));
  
      // If the maximum component is greater than 1, scale the vector down
      if (maxComponent > 1) {
        down.divideScalar(maxComponent);
      }
  
      console.log('Clamped down direction:', down);
  
      const position = group.current.position.clone();
  
      // Set the raycaster to start from the group's current position and point downwards
      raycasterDown.set(position, down);
  
      // Check for intersections with objects
      const intersectsDown = raycasterDown.intersectObjects(objp, true);
  
      if (intersectsDown.length > 0) {
        const closestIntersection = intersectsDown[0]; // Get the first (closest) intersection
        const intersectionPoint = closestIntersection.point; // The point of intersection
  
          // Move the group to the intersection point
          const dist = raycasterDown.ray.origin.distanceTo(intersectionPoint);
          const movementVector = down.clone().multiplyScalar(dist);

          // Update the group's position
          group.current.position.add(movementVector);
  
        console.log("ray down:", raycasterDown.ray.direction);
        console.log("group down:", down);
        console.log("dist:", dist);
  
      } else {
        console.log("No object below the group.");
      }
    }
  };
  




  // useEffect(() => {
    
  //   const handleGroupChange = () => {
  //     updateGroupRaycasters();
  //     hightlightObjects();
  //     moveGroupDownIfIntersecting();
  //   };
  
  //   // Add event listeners for relevant group events
  //   const groupNode = group.current;
  //   groupNode.addEventListener('change', handleGroupChange);
  
  //   // Cleanup function to remove event listener when component unmounts
  //   return () => {
  //     groupNode.removeEventListener('change', handleGroupChange);
  //   };
  // }, [group.current]);


  // Component state initialization
  const [targetPosition, setTargetPosition] = useState(null);
  const [isMovingDown, setIsMovingDown] = useState(false);

  // Function to lerp between two positions
  function lerp(start, end, alpha) {
    return start + (end - start) * alpha;
  }

  useFrame((state, delta) => {
    const { forward, leftward, rightward } = getKeys();
    const playerPosition = group.current?.position;

    if (playerPosition) {
      if (group.current && state.camera) {
        if (forward) {
          setMovementState(MovementState.FORWARD);
          // handleContinuousMovement(state, delta);
          setPlayerMove();
          // checkCollisions();
        }

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

     //updateGroupRaycasters();
     updateGroupRaycasters();
      hightlightObjects();
      moveGroupDownIfIntersecting();
   // Set the raycaster origin to the group's position and direction to downwards
 
      // // Smoothly move the player down to the target position
      // if (isMovingDown && targetPosition !== null) {
      //   const newY = lerp(group.current.position.y, targetPosition, delta * 10); // Adjust the speed as needed
      // //  group.current.position.y = newY;

      //   // Stop moving when close enough to the target position
      //   if (Math.abs(group.current.position.y - targetPosition) < 0.01) {
      //     group.current.position.y = targetPosition;
      //     setIsMovingDown(false);
      //     setTargetPosition(null);
      //   }
      // }

      
      // console.log("-------", group.current.position.y);
      // console.log("-GOING DOWN------", isMovingDown);
    }
  });

  return (
    <>
      <RigidBody
        enabledRotations={[false, true, true]}
        type="static"
        colliders="cuboid"
        ref={body}
        position={[0, 3, 6]}
        mass={1}
        restitution={0}
        friction={0}
      ></RigidBody>

      <group ref={group}>
        <mesh ref={player}>
          <meshPhongMaterial color="#ff0000" opacity={0.1} transparent />
          <boxGeometry />
        </mesh>
        <perspectiveCamera ref={cameraRef} position={[0, 0, 0]} />{" "}
      </group>
    </>
  );
}
