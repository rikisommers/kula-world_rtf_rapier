import * as THREE from 'three'

import BlockStart from './BlockStart';
import BlockEnd from './BlockEnd';
import BlockCube from './BlockCube';
import BlockCoin from './BlockCoin';
import BlockPortal from './BlockPortal';
import BlockKey from './BlockKey';

import { useRef } from 'react';
const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
const floor1Material = new THREE.MeshStandardMaterial({ color: 'limegreen' })
const floor2Material = new THREE.MeshStandardMaterial({ color: 'greenyellow' })
const obstacleMaterial = new THREE.MeshStandardMaterial({ color: 'orangered' })
const wallMaterial = new THREE.MeshStandardMaterial({ color: 'slategrey' })
const portalMaterial = new THREE.MeshStandardMaterial({ color: 'slategrey' })
const coinMaterial = new THREE.MeshStandardMaterial({ color: '#000' })





export default function Block({
  position = [[0, 0, 0]], // An array of positions for each instance
  blockType,
  material,
  hasCoin,
  hasKey
}) {

  //console.log(material)

  let primitive = null;
  
  if (blockType === 'start') { 
    primitive = <BlockStart 
    position={position}
    geometry={boxGeometry}
    material={material}

    />
  } else if (blockType === 'end') {
    primitive = <BlockEnd
    position={position}
    geometry={boxGeometry}
    material={material}

    />
  } else if (blockType === 'cube') {
    primitive = <BlockCube 
    position={position}
    material={material}
    hasCoin={hasCoin}
    hasKey={hasKey}

    />

  }else if(blockType === 'coin') {
    primitive = <BlockCoin 
    position={position}
    geometry={boxGeometry}
    material={material}
    />

  }else if(blockType === 'key') {
    primitive = <BlockKey 
    position={position}
    geometry={boxGeometry}
    material={material}
    />
  }else if(blockType === 'portal') {
    primitive = <BlockPortal
    position={position}
    geometry={boxGeometry}
    material={material}
    />
  }

  return (

      <>
      {primitive}
        {/* <primitive
          object={cube.scene.clone()} // Clone the scene for each instance
          scale={ 0.50 } 
          position={position} 
        /> */}
        </>
  );
}
