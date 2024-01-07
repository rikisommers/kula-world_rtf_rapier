import * as THREE from "three";
import { useRapier, RigidBody } from "@react-three/rapier"; // Correct import for Quat and Euler
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls, useAnimations, useGLTF, Sparkles, TransformControls, PivotControls, Center } from "@react-three/drei";
import {  useEffect, useCallback, useRef, useState } from "react";
import useGame from "./stores/useGame.jsx";
import { playFall, playLand, playStart } from "./Audio.jsx";
import { gravityDirectionDict } from "./stores/useGame.jsx";
import { gsap } from "gsap";
import { CapsuleCollider, RigidBody } from "@react-three/rapier";

const directionMap = {
  0: "forward",
  1: "left",
  2: "back",
  3: "right",
};


export default function Player({
  onPlayerPositionChange,
  onPlayerDirectionChange,
  onCameraDirectionChange,
}) {
  const ball = useGLTF("");


 
  
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

  const [orientation, setOrientation] = useState(Math.PI);
  const [knightRun, setknightRun] = useState("Idle");



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

  




  const jump = () => {
    //console.log('Yes, jump!')
    const origin = body.current.translation();
    origin.y -= 0.61;
    const direction = { x: 0, y: -1, z: 0 };
    const ray = new rapier.Ray(origin, direction);
    const hit = world.castRay(ray, 10, true);

    //console.log(hit.toi)
    if (hit.toi < 0.15) playLand(); // Play the sound when the ball lands

    body.current.applyImpulse({ x: 0, y: 4, z: 0 });
    // body.current.setLinvel({ x: 0, y: 0.5, z: 1 })
  };


  let isPlayerMoving = false;

  const setPlayerMove = () => {

    if (isPlayerMoving) {
      return;
  }
  isPlayerMoving = true;

  const targetDirection = new THREE.Vector3(0, 0, -1); // Assuming the forward direction
  const duration = 1; // Set the desired duration in seconds

  // Apply the player's rotation to the direction vector
  targetDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), player.current.rotation.y);
  
  // Scale the direction by the desired movement distance (width of the block)
  targetDirection.multiplyScalar(1); // Always move in increments of 1 box width
  
  const targetPosition = new THREE.Vector3().copy(player.current.position).add(targetDirection);

     // Use GSAP to tween the player's position
     gsap.to(player.current.position, {
      duration,
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
      ease: "power2.inOut",
      onComplete: () => {
          // Reset the flag when the tween is complete
          isPlayerMoving = false;
      },
  });

  };

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

  // useFrame((state, delta) => {
  //   const { forward , leftward, rightward} = getKeys();
  //   const playerPosition = player.current?.position;
  //   const { x: camPosX, y: camPosY, z: camPosZ } = camPosition;

  //   if (playerPosition) {

  //     if (forward && !isKeyPressed && !isPlayerMoving) {
  //       setIsKeyPressed(true);
  //       setPlayerMove(playerMovementTop[cameraStateIndex]);
  //     } else if (!forward && isKeyPressed) {
  //       setIsKeyPressed(false);
  //     }

  //     const cameraPosition = playerPosition.clone().add(new THREE.Vector3(camPosX, camPosY, camPosZ));
  //     const cameraTarget = playerPosition.clone().add(new THREE.Vector3(0, 0.25, 0));
      
  //     // Use the cameraTarget variable in the following lines
  //     smoothedCameraPosition.lerp(cameraPosition, 5 * delta);
  //     smoothedCameraTarget.lerp(cameraTarget, 5 * delta);

  //     // Set camera position and look at the player
  //     state.camera.position.copy(smoothedCameraPosition);
  //     state.camera.lookAt(smoothedCameraTarget);
  //     state.camera.up.set(0, 1, 0);

  //   }

  //   if (player.current && transformControls.current) {
  //     // Update TransformControls rotation based on player's rotation
  //     transformControls.current.position.copy(player.current.position);

  //     transformControls.current.rotation.copy(player.current.rotation);
  //   }

  // });


  
  useFrame((state, delta) => {
    // retrieve keys
    const keys = getKeys();

    let { forward, backward, leftward, rightward } = keys;

    // Keys pressed counter
    const nbOfKeysPressed = Object.values(keys).filter((key) => key).length;

    if (forward && backward && nbOfKeysPressed === 2) forward = false;

    if (leftward && rightward && nbOfKeysPressed === 2) leftward = false;

    /**
     * Model movement
     */

    const linvelY = body.current.linvel().y;

    // Reduce speed value if it's diagonal movement to always keep the same speed
    const normalizedSpeed =
      nbOfKeysPressed == 1 ? speed * delta : Math.sqrt(2) * (speed / 2) * delta;

    const impulse = {
      x: leftward ? -normalizedSpeed : rightward ? normalizedSpeed : 0,
      y: linvelY,
      z: forward ? -normalizedSpeed : backward ? normalizedSpeed : 0
    };

    // Set model currennt linear velocity
   body.current.setLinvel(impulse);

    /**
     * Model orentation
     */

    const angle = Math.PI / 4 / 7; // rotation normalizedSpeed (more divided => more smooth)

    const topLeftAngle = 3.927; // (225 * Math.PI / 180).toFixed(3)

    const bottomLeftAngle = 5.498; // (315 * Math.PI / 180).toFixed(3)

    const topRightAngle = 2.356; // (135 * Math.PI / 180).toFixed(3)

    const bottomRightAngle = 0.785; // (45 * Math.PI / 180).toFixed(3)

    let aTanAngle = Math.atan2(Math.sin(orientation), Math.cos(orientation));
    aTanAngle = aTanAngle < 0 ? aTanAngle + Math.PI * 2 : aTanAngle;
    aTanAngle = Number(aTanAngle.toFixed(3));
    aTanAngle = aTanAngle == 0 ? Number((Math.PI * 2).toFixed(3)) : aTanAngle;

    const keysCombinations = {
      forwardRight: forward && !backward && !leftward && rightward,
      forwardLeft: forward && !backward && leftward && !rightward,
      backwardRight: !forward && backward && !leftward && rightward,
      backwardLeft: !forward && backward && leftward && !rightward,
      forward: forward && !backward && !leftward && !rightward,
      right: !forward && !backward && !leftward && rightward,
      backward: !forward && backward && !leftward && !rightward,
      left: !forward && !backward && leftward && !rightward
    };



 
    // Rightward
    if (keysCombinations.right && Math.sin(orientation) != 1) {
      setOrientation(
        (prevState) => prevState + angle * (Math.cos(orientation) > 0 ? 1 : -1)
      );
    }

    // Leftward
    if (keysCombinations.left && Math.sin(orientation) != -1) {
      setOrientation(
        (prevState) => prevState + angle * (Math.cos(orientation) > 0 ? -1 : 1)
      );
    }

    // Forward
    if (keysCombinations.forward && Math.cos(orientation) != -1) {
      setOrientation(
        (prevState) => prevState + angle * (Math.sin(orientation) > 0 ? 1 : -1)
      );
    }

    // Backward
    if (keysCombinations.backward && Math.cos(orientation) != 1) {
      setOrientation(
        (prevState) => prevState + angle * (Math.sin(orientation) > 0 ? -1 : 1)
      );
    }

    // Lock X and Z model rotations and update rotation Y
    const quaternionRotation = new THREE.Quaternion();
    quaternionRotation.setFromEuler(new THREE.Euler(0, orientation, 0));
    knightBody.current.setRotation(quaternionRotation);

    /**
     * Camera Movement
     */
    if (!props.orbitControls) {
      const knightPosition = body.current.translation();

      const cameraPosition = new THREE.Vector3();
      cameraPosition.copy(knightPosition);
      cameraPosition.z += 5;
      cameraPosition.y += 2.5;

      const cameraTarget = new THREE.Vector3();
      cameraTarget.copy(knightPosition);
      cameraTarget.y += 0.25;

      state.camera.position.copy(cameraPosition);
      state.camera.lookAt(cameraTarget);
    }
  });



  return (
    
        <TransformControls  ref={transformControls} object={player.current} position={[0,0,0]} >

        <RigidBody
        lockRotations={true}
        ref={body}
        colliders={false}
        position={[0, 1, 0]}
        restitution={0.2}
        friction={1}
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
