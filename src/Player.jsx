import * as THREE from "three";
import { useRapier, RigidBody } from "@react-three/rapier"; // Correct import for Quat and Euler
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls, PivotControls, useGLTF } from "@react-three/drei";
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
import { useAudioControls} from './Audio.jsx'
const directionMap = {
  0: "forward",
  1: "left",
  2: "back",
  3: "right",
};

const easingOptions = { easeIn: 0.05, easeOut: 0.05 };

export default function Player({ blocks, positions, objects }) {

  const {
    playStart,
    playJump,
    playMove,
    playEnd,
    playPop,
    playLand,
    playCoin,
    playFood,
    playFall,
  } = useAudioControls();


  const start = useGame((state) => state.start);
  const end = useGame((state) => state.end);
  const restart = useGame((state) => state.restart);


  const [blockPositions, setBlockPositions] = useState(0);
  const gravityDirection = useGame((state) => state.gravityDirection);
  const setGravityDirection = useGame((state) => state.setGravityDirection);
  const setCameraDirection = useGame((state) => state.setCameraDirection);
  const objp = useGame((state) => state.objectPositions);
  const [isMoving, setIsMoving] = useState(false);
  const [isJumping, setIsJumping] = useState(false);

  const [rotationSpeed, setRotationSpeed] = useState(0);

  // console.log('___________-__-_-_',objp)
  //console.log(blocks, positions, objects)

  const ball = useGLTF("./ball2.glb");

  //console.log(ball);

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
  const [isMovingForward, setIsMovingForward] = useState(false);


  const [subscribeKeys, getKeys] = useKeyboardControls();
  const [isKeyPressed, setIsKeyPressed] = useState(false);

  const { rapier, world } = useRapier();
  const body = useRef();
  const player = useRef();
  const cameraRef = useRef();
  const group = useRef();

  const deltaTime = 1 / 60; // Assuming 60 FPS, adjust if needed

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

    // if (player.current) {
    //   player.current.rotateY(0, Math.PI / 2, 0);
    // }
    
  }, [positions]);

  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------




  const [rotationTarget, setRotationTarget] = useState(null);








  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------



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
          setIsMoving(true);
          //setMovementState(MovementState.BACKWARD);
        } else {
          setIsMoving(false);
        }
      }
    );

    const unsubscribeForward = subscribeKeys(
      (state) => state.forward,
      (value) => {
        if (value) {
          //          turnPlayerUp();
          setPlayerMove();
          setIsMoving(true);

          setMovementState(MovementState.FORWARD);
          //console.log("direction:", livePlayerDirection);
        } else {
          setIsMoving(false);
        }
      }
    );

    const unsubscribeLeft = subscribeKeys(
      (state) => state.leftward,
      (value) => {
        if (value) {
          turnPlayerLeft();
          setIsMoving(true);
        } else {
          setIsMoving(false);
        }
      }
    );

    const unsubscribeRight = subscribeKeys(
      (state) => state.rightward,
      (value) => {
        if (value) {
          turnPlayerRight();
          setIsMoving(true);
        } else {
          setIsMoving(true);
        }
      }
    );

    const unsubscribeJump = subscribeKeys(
      (state) => state.jump,
      (value) => {
        if (value) {
           jump();
        }
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
  const raycasterCam = new THREE.Raycaster();
  const arrowHelperForward = useRef();
  const arrowHelperDown = useRef();
  raycasterDown.far = 5; // Set the far property to an appropriate value
  raycasterForward.far = 1; // Set the far property to an appropriate value

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

      const ddir = new THREE.Vector3(0, -1, 0)
        .applyQuaternion(group.current.quaternion)
        .normalize();
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

    }
  };


  const checkEdges = () => {
    const intersects = raycasterDown.intersectObjects(objp, true);
    return intersects.length === 0;
  };


  const hightlightObjects = () => {
    const intersectsDown = raycasterDown.intersectObjects(objp, true);


  //   const dir = group.current.position
  //   .clone()
  //   .sub(camera.position)
  //   .normalize()
  
  // raycasterCam.set(camera.position, dir)
  // const intersectsCam = raycasterCam.intersectObject(cube)
  
  // if (intersectsCam.length > 0) {
  //   intersectsDown.forEach((intersection, index) => {
  //     const closestIntersection = intersectsDown[0];
  //     const object = closestIntersection.object;

  //     object.material.opacity = 0.2;

  //     // Optionally, set a timeout to revert the material back after a certain time
  //   });
  // }


    if (intersectsDown.length > 0) {
      intersectsDown.forEach((intersection, index) => {
        const closestIntersection = intersectsDown[0];
        const object = closestIntersection.object;

      //  console.log(object)
        if(object.type === 'end'){
          end();
        }
        // const { object, faceIndex } = intersection;
        const originalMaterial = object.material;
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


  const moveGroupIfIntersecting = () => {
    if (group.current) {
      // Update the raycaster direction to point downwards relative to the group
      const down = new THREE.Vector3(0, -1, 0).applyQuaternion(
        group.current.quaternion
      );

      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(
        group.current.quaternion
      );

      // Normalize the direction vector
      down.normalize();
      forward.normalize();

      // Find the maximum absolute component value
      const maxComponentDown = Math.max(
        Math.abs(down.x),
        Math.abs(down.y),
        Math.abs(down.z),
      );
      const maxComponentForward = Math.max(
        Math.abs(forward.x),
        Math.abs(forward.y),
        Math.abs(forward.z),
      );
      // If the maximum component is greater than 1, scale the vector down
      if (maxComponentDown > 1) {
        down.divideScalar(maxComponentDown);
      }
      if (maxComponentForward > 1) {
        down.divideScalar(maxComponentForward);
      }
      //console.log('Clamped down direction:', down);

      const position = group.current.position.clone();

      // Set the raycaster to start from the group's current position and point downwards
      raycasterDown.set(position, down);
      raycasterForward.set(position, forward);

      // Check for intersections with objects
      const intersectsDown = raycasterDown.intersectObjects(objp, true);
      const intersectsForward = raycasterForward.intersectObjects(objp, true);

      if (intersectsDown.length > 0) {
        setHasHitEdge(false)
        setRotationComplete(false);

        const closestIntersection = intersectsDown[0]; // Get the first (closest) intersection
        const intersectionPoint = closestIntersection.point; // The point of intersection

        // Move the group to the intersection point
        const dist =
          raycasterDown.ray.origin.distanceTo(intersectionPoint) -
          player.current.scale.y / 2;
        const movementVector = down.clone().multiplyScalar(dist);

        // Update the group's position
       if(!isJumping){
        group.current.position.add(movementVector);
       }
        //console.log("ray down:", raycasterDown.ray.direction);
        //console.log("group down:", down);
        //console.log("dist:", dist);
      } else {
        //console.log("No object below the group.");
        turnPlayerDown();
        setHasHitEdge(true)
      }

      // if (intersectsForward.length > 0) {

      //   turnPlayerUp();
      //   setHasHitWall(true)

      //   console.log("ray forward:", raycasterForward.ray.direction);
      //   //console.log("group down:", down);
      //   //console.log("dist:", dist);
    
      // }else{
      //   setRotationComplete(false);

      // }

    }
  };



  // Function to lerp between two positions
  function lerp(start, end, alpha) {
    return start + (end - start) * alpha;
  }






  const updateCamera = (state) => {
    const playerPosition = group.current?.position;

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
    
  };






  const setPlayerMove = useCallback(() => {
    const moveDirection = new THREE.Vector3(0, 0, -1);
    moveDirection.applyQuaternion(group.current.quaternion).normalize();

    const moveSpeed = 0.15;
    group.current.position.add(moveDirection.multiplyScalar(moveSpeed));
  }, []);

  const [previousPosition, setPreviousPosition] = useState(new THREE.Vector3());




  const [rotationComplete, setRotationComplete] = useState(false);



  const turnPlayerDown = () => {
    setIsMoving(false)
      if(!rotationComplete){
        
        group.current.rotateX(-Math.PI / 2);
        group.current.quaternion.normalize();
        group.current.up.set(0, 1, 0);

        setRotationComplete(true);
        setHasHitEdge(false);
      }
     playMove();
      setIsMoving(true)

  };



  const turnPlayerUp = () => {
    setIsMoving(false)
      if(!rotationComplete){
        
        group.current.rotateX(Math.PI / 2);
        group.current.quaternion.normalize();
        group.current.up.set(0, 1, 0);

        setRotationComplete(true);
        setHasHitWall(false);
      }
     playMove();
      setIsMoving(true)

  };

  // const turnPlayerUp = () => {
  //   if (!isExecuted) {
  //     // Get the current Euler rotation of the group
  //     const currentRotation = group.current.rotation.clone();

  //     const G = isMultipleOfPi(currentRotation.y);

  //     // Calculate the new x rotation taking into account the current y rotation
  //     const targetRotationX =
  //       Math.round(currentRotation.x / (Math.PI / 2)) * (Math.PI / 2) +
  //       Math.PI / 2;

  //     // Calculate the new y rotation (no change in this case)
  //     const targetRotationY = currentRotation.y;
  //     const targetRotationZ = currentRotation.z;

  //     group.current.rotateX(Math.PI / 2);
  //     // Apply the new rotation
  //     // gsap.to(group.current.rotation, {
  //     //     duration: 0.3,
  //     //     x: targetRotationX,

  //     //     ease: "linear",
  //     //     onComplete: () => {

  //     //       console.log('IS LEFT OR RIGHT: ', isMultipleOfPi(targetRotation))

  //     //         updatePlayerUpDirection();
  //     //     },
  //     // });
  //   }
  // };



//   const turnPlayerDown = () => {

//     if (!rotationComplete) {
//         gsap.to({}, {
//             duration: 1, // duration of the animation in seconds
//             onUpdate: function() {
//                 group.current.rotateX(-Math.PI / 2 / 60); // Assuming 60 updates per second
//                 group.current.quaternion.normalize();
//             },
//             onComplete: () => {
//                 group.current.up.set(0, 1, 0);
//                 setRotationComplete(true);
//                 setHasHitEdge(false);
//             },
//             ease: "power1.inOut"
//         });
//     }
// };


const turnPlayerLeft = () => {
  const currentRotation = group.current.rotation.y;
  const targetRotation =
    Math.round(currentRotation / (Math.PI / 2)) * (Math.PI / 2) + Math.PI / 2;

  group.current.rotateY(Math.PI / 2);
  playMove();

};



const turnPlayerRight = () => {
  const currentRotation = group.current.rotation.y;
  const targetRotation =
    Math.round(currentRotation / (Math.PI / 2)) * (Math.PI / 2) - Math.PI / 2;

  group.current.rotateY(-(Math.PI / 2));
  playMove();

};




  const jump = useCallback(() => {

    setIsJumping(true);
    // Remove Rapier dependencies
    const playerPosition = group.current.position;

    // Use raycasterDown to check distance to ground
    updateGroupRaycasters();
    playJump();

    // Use opposite direction of raycasterDown to define up direction
    const upDirection = raycasterDown.ray.direction.clone().negate();

    // Move group.current up 3x scale.y
    const targetPosition = playerPosition.clone().add(upDirection.multiplyScalar(1 * player.current.scale.y));

    // Move group.current down to closest intersect over 1 sec
    const intersectsDown = raycasterDown.intersectObjects(objp, true);
    const closestIntersection = intersectsDown[0];
    const intersectionPoint = closestIntersection ? closestIntersection.point : playerPosition;
    const duration = 0.3; // Duration of movement in seconds
    
    gsap.to(group.current.position, { 


      x: targetPosition.x, 
      y: targetPosition.y, 
      z: targetPosition.z, 
      duration,
      ease: "inOut", // Use bounce easing
      onComplete: () => {
        
              // If no intersection, fall back to original position
              gsap.to(group.current.position, { 
                  x: group.current.position.x , 
                  y: playerPosition.y - 1 * player.current.scale.y, 
                  z: playerPosition.z - 1 * player.current.scale.z, 
                  duration,
                  ease: "inOut", // Use bounce easing
                  onComplete: () => {

                    // gsap.to(group.current.position, { 
                    //   x: group.current.position.x, 
                    //   y: playerPosition.y + 1 * player.current.scale.y, 
                    //   z: playerPosition.z, 

                    // });

                    playLand();


                    // Set isMoving back to true after jump is complete
                    if (getKeys().forward) {
                      // Set isMoving back to true after jump is complete only if forward key is down
                      setIsJumping(false);
                      
                  }
                  },
              });
          
  

      } 
  });
}, []);



const gsapRef = useRef(null); // Reference to the GSAP animation instance


const idle = useCallback(() => {
  if (!isMoving) {
    gsapRef.current = gsap.to(group.current.scale, {
      y: 0.85,
      duration: 0.7,
      ease: 'power1.inOut',
      repeat: -1,
      yoyo: true,
    });
  }
}, [isMoving]);

useEffect(() => {
  if (!isMoving) {
    idle();
  } else if (gsapRef.current) {
    gsapRef.current.kill(); // Stop the idle animation if player starts moving
    gsap.to(group.current.scale, { y: 1, duration: 0.5 }); // Reset scale to 100%
  }
}, [isMoving, idle]);








  useFrame((state, delta) => {
    const { forward, leftward, rightward } = getKeys();
    const playerPosition = group.current?.position;

    //console.log('is moving: ',isMoving)
    //console.log('has hit edge: ',hasHitEdge)
    // Define variables for rotation speed and easing
    let rotationSpeed = 0.3; // Base rotation speed
    const maxRotationSpeed = 0.5; // Maximum rotation speed
    const acceleration = 0.01; // Rate of rotation acceleration
    const deceleration = 0.02; // Rate of rotation deceleration

    if (forward) {

      // gsap.to(player.current.scale, {
      //   y: 1,
      //   duration: 0.5, // Duration of the animation in seconds
      //   ease: 'power1.inOut', // Easing function for smooth animation
      // });

      rotationSpeed += acceleration * delta; // Accelerate rotation
      rotationSpeed = Math.min(rotationSpeed, maxRotationSpeed); // Cap rotation speed

      setPlayerMove();
      updateGroupRaycasters();
    //  hightlightObjects();
      moveGroupIfIntersecting();
    } else {

 

      // Decrease rotation speed if not moving forward
      rotationSpeed -= deceleration * delta; // Decelerate rotation
      rotationSpeed = Math.max(rotationSpeed, 0); // Ensure rotation speed is not negative
    }


    // Update camera only if there is movement
    if (isMoving) {



      updateCamera(state);
    }else{

    }

    // FAKE -- Calculate distance moved
    if (forward) {
      player.current.rotation.x -= rotationSpeed;
    }
  });

  //FIXED -- Calculate distance moved
  // const currentPosition = group.current.position.clone();
  // const distanceMoved = currentPosition.distanceTo(previousPosition);
  // setPreviousPosition(currentPosition);

  // // Calculate rotation angle based on distance moved
  // const ballRadius = 1; // Adjust this value based on your ball's radius
  // const rotationAngle = distanceMoved / ballRadius;

  // // Rotate the ball
  // player.current.rotation.x -= rotationAngle;



  return (
    <>
  

    <group ref={group}>
    <RigidBody
  type="kinematicPosition"
  ref={body}
  colliders="cuboid"
  enabledRotations={[false, true, true]}
  restitution={1}
  friction={1}
  position={[0, 0, 0]}
>
      <mesh ref={player}>
        <meshPhongMaterial color="#ff0000" opacity={0.1} transparent  />
        <boxGeometry />
      </mesh>
      <mesh
        ref={player}
        scale={player.scale}
        material={ball.scene.children[0].material}
        rotation={[0, 0, Math.PI / 2]} // Rotate 90 degrees around the X-axis

      >
        <sphereGeometry args={[0.5, 120, 64]} />
      </mesh>

      <perspectiveCamera ref={cameraRef} position={[0, 0, 0]} />
      </RigidBody>
    </group>
    </>
  );
}
