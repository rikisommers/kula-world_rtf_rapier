import * as THREE from "three";
import { RigidBody } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Sparkles } from "@react-three/drei";
import { useGLTF } from "@react-three/drei";
import { MeshReflectorMaterial } from "@react-three/drei/materials/MeshReflectorMaterial";

export default function BlockKey({
  position = [0, 0, 0],
  geometry,
  material,
}) {
  const key = useGLTF("./key.glb");
  const keyRef = useRef();

  // useEffect(() => {
  //   // GSAP animation for rotation
  //   gsap.to(keyRef.current.rotation, {
  //     z: "+=6.28319", // Rotate 360 degrees (2 * Math.PI in radians)
  //     repeat: -1, // Infinite repeat
  //     ease: "none", // Linear easing
  //     duration: 5, // Duration in seconds for one complete rotation
  //   });
  // }, []);



 
  return (
    <RigidBody 
    type="fixed"
    colliders="cuboid"
    restitution={ 1 }
    friction={ 1  }
    position={ [ 0, 0, 0 ] }
    onCollisionEnter={({ manifold, target, other }) => {
      console.log(
        "end",
      // manifold.solverContactPoint(0),
      );
      restart()
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
  



    <group position={position}>

    <primitive
       name="key"
       position={[0, 1.5, 0]}
       rotation={[1.5,0,0]}
        receiveShadow // Add this line to enable shadow reception
        castShadow // Add this line to enable casting shadows
        object={key.scene.clone()} // Clone the scene for each instance
        scale={0.15}
        ref={keyRef} // Reference to the mesh for GSAP animation
        
        //  position={position}
      />

<mesh 
  name="floor"
  type="party"
  geometry={geometry}
  material={material}
  />

</group>
    </RigidBody>
  );
}
