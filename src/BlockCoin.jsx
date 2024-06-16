import * as THREE from "three";
import { RigidBody } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Sparkles } from "@react-three/drei";
import { useGLTF } from "@react-three/drei";
import { MeshReflectorMaterial } from "@react-three/drei/materials/MeshReflectorMaterial";

export default function BlockCoin({
  position = [0, 0, 0],
  geometry,
  material,
}) {
  const coin = useGLTF("./coin.glb");
  const coinRef = useRef();

  useEffect(() => {
    // GSAP animation for rotation
    gsap.to(coinRef.current.rotation, {
      z: "+=6.28319", // Rotate 360 degrees (2 * Math.PI in radians)
      repeat: -1, // Infinite repeat
      ease: "none", // Linear easing
      duration: 5, // Duration in seconds for one complete rotation
    });
  }, []);

  return (
    <group position={position}>
      <primitive
        name="coin"
        position={[0, 1.2, 0]}
        rotation={[1.5,0,0]}
        receiveShadow // Add this line to enable shadow reception
        castShadow // Add this line to enable casting shadows
        object={coin.scene.clone()} // Clone the scene for each instance
        scale={0.3}
        ref={coinRef} // Reference to the mesh for GSAP animation

        //  position={position}
      />

      <mesh name="floor" type="party" geometry={geometry} material={material} />
    </group>
  );
}
