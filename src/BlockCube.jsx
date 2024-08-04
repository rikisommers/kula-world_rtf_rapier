import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

import { useTexture } from "@react-three/drei";
import { useLoader } from '@react-three/fiber';

export default function BlockCube({ 
  position = [0, 0, 0],
  geometry,
  material,
  hasCoin
 }) {

  const coin = useGLTF("./coin.glb");
  const coinRef = useRef();

  const cube = useGLTF("./cube/cube-flat.glb");
  cube.scene.traverse(function (node) {
    if (node.isMesh) {
      node.receiveShadow = true;
    }
  });


  // useEffect(() => {
  //   if(coinRef.current){
  //   // GSAP animation for rotation
  //   gsap.to(coinRef.current.rotation, {
  //     z: "+=6.28319", // Rotate 360 degrees (2 * Math.PI in radians)
  //     repeat: -1, // Infinite repeat
  //     ease: "none", // Linear easing
  //     duration: 5, // Duration in seconds for one complete rotation
  //   });

  // }
  // }, []);


  console.log(material)

const floor1Material = new THREE.MeshStandardMaterial({ color: 'limegreen' })
const floor2Material = new THREE.MeshStandardMaterial({ color: 'greenyellow' })
const obstacleMaterial = new THREE.MeshStandardMaterial({ color: 'orangered' })
const wallMaterial = new THREE.MeshStandardMaterial({ color: 'slategrey' })
const portalMaterial = new THREE.MeshStandardMaterial({ color: 'slategrey' })
const coinMaterial = new THREE.MeshStandardMaterial({ color: '#000' })




  // const [colorMap, displacementMap, normalMap, roughnessMap, aoMap] = useTexture([
  //   './Concrete_018_BaseColor.jpg',
  //   './Concrete_018_Height.png',
  //   './Concrete_018_Normal.jpg',
  //   './Concrete_018_Roughness.jpg',
  //   './Concrete_018_AmbientOcclusion.jpg'
  // ]);

  const map = new THREE.TextureLoader().load( './cube/tile2.jpg' );
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.colorSpace = THREE.SRGBColorSpace;
  // /map.repeat.set(0.2, 1);  // 
    
  const normalMap = new THREE.TextureLoader().load( './cube/tile2-normal.jpg' );
  map.wrapS = map.wrapT = THREE.RepeatWrapping
  map.colorSpace = THREE.SRGBColorSpace;
  map.repeat.set(0.25, 0.25);  // 


  const roughnessMap = new THREE.TextureLoader().load( './cube/tile1-bump.jpg' );
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.colorSpace = THREE.SRGBColorSpace;
  map.repeat.set(0.25, 0.25);  // 
 // Adjust texture properties
 const myMaterial = new THREE.MeshPhongMaterial( { map: normalMap, side: THREE.DoubleSide } );

 const transparentMaterial = new THREE.MeshBasicMaterial({
  color: 'blue',
  transparent: true,
  opacity: 0,
});

  // const material = new THREE.MeshPhysicalMaterial({  
  //   displacementMap: displacementMap,
  //   normalMap: normalMap,
  //   roughnessMap: roughnessMap,
  //   aoMap: aoMap,

  //   roughness: 0.7,   
  //   transmission: 1,  
  //   thickness: 1,
  //   normalMap:normalMap,

  // });

  const boxGeometry = new THREE.BoxGeometry(1, 1, 1)

  let coinElement = null;

  if(hasCoin){
    coinElement =(
    <primitive
        name="coin"
        material={myMaterial}
        position={[0, 1.2, 0]}
        rotation={[1.5,0,0]}
        object={coin.scene.clone()} // Clone the scene for each instance
        scale={0.3}
        ref={coinRef} // Reference to the mesh for GSAP animation

        //  position={position}
      />
    )
  }


  let childElement = null;

  switch (material) {
    case 'e':
      childElement = (
        <primitive
          object={cube.scene.clone()} // Clone the scene for each instance
          scale={0.5}
        />
      );
      break;
    case 'c':
      childElement = (
        <primitive
          object={cube.scene.clone()} // Clone the scene for each instance
          scale={0.5}
        />
      );
      break;
    case 'g':
      childElement = (
        <primitive
          object={cube.scene.clone()} // Clone the scene for each instance
          scale={0.5}
        />
      );
      break;
    default:
      // Handle default case or invalid material type
      console.warn(`Invalid material type: ${material}`);
      break;
  }


  return (
    <group position={position}>




{coinElement}
  

      <mesh geometry={boxGeometry} material={transparentMaterial}   name="floor">
      {childElement}
     
      </mesh> 
    
    </group>
  );
}
