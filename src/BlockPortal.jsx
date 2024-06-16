import * as THREE from "three";
import { RigidBody } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

export default function BlockPortal({
  position = [0, 0, 0],
  geometry,
  material,
}) {
  const [sparklesVisible, setSparklesVisible] = useState(false);
  const [hit, setHit] = useState(false);
  const coin = useRef();
  const sparkle = useRef(null);

  if (coin.current) {
   // coin.current.material.opacity = 0.5;
  }

  useEffect(() => {
    if (hit === true) {
      setSparklesVisible(true);
  
      // Optionally, set a timeout to hide the sparkles after a certain duration
      setTimeout(() => {
        setSparklesVisible(false);
      }, 1500); // Adjust the duration as needed
    }
     
     
  }, [hit]);

  useFrame(({ clock }) => {
    if (coin.current) {
      coin.current.rotation.y = Math.sin(clock.elapsedTime / 2);
      // Adjust the animation logic based on your requirements
    }
  });
  
  return (
    <group position={position}>
      <group
        ref={coin}
        position={[0, 1, 0]}
      > 
    </group>


      <RigidBody
        type="fixed"
        colliders="cuboid"
        restitution={1}
        friction={1}
        onCollisionEnter={({ manifold, target, other }) => {
          console.log(
            "coin"
            // manifold.solverContactPoint(0),
          );
          setHit(true);
          // playCoin();

          if (other.rigidBodyObject) {
            // console.log(
            //   // this rigid body's Object3D
            //   target.rigidBodyObject.name,
            //   " collided with ",
            //   // the other rigid body's Object3D
            //   other.rigidBodyObject.name
            // );
          }
        }}
      >
        <mesh receiveShadow geometry={geometry} material={material} />
      </RigidBody>
    </group>
  );
}
