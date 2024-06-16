import { RigidBody } from "@react-three/rapier";
import useGame from './stores/useGame.jsx'
import { useTexture } from "@react-three/drei"


export default function BlockEnd({
  position = [0, 0, 0],
  geometry,
  material
}) {

  const restart = useGame((state) => state.restart)
  // const [colorMap, displacementMap, normalMap, roughnessMap] = useTexture([
  //   '../pub/rock-color.png',
  //   './rock-disp.png',
  //   './rock-normal',
  //   './rock-disp.png',
  // ])

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

    <mesh 
      name="floor"
      type="end"
      geometry={geometry}
      material={material}
      >
        {/* <meshStandardMaterial
          map={colorMap}
          displacementMap={displacementMap}
          normalMap={normalMap}
          roughnessMap={roughnessMap}
        ></meshStandardMaterial> */}
      </mesh>

    </group>
    </RigidBody>
  );
}


// import { Float, Text, useGLTF } from '@react-three/drei'
// import { RigidBody } from "@react-three/rapier";

// export default function BlockEnd({ position = [ 0, 0, 0 ], geometry, material })
// {



//     const cube = useGLTF('./ball1.glb')


//     const ball = useGLTF('./ball1.glb')


//     const hamburger = useGLTF('./hamburger.glb')
//     hamburger.scene.children.forEach((mesh) =>
//     {
//         mesh.castShadow = true
//     })

//     return(
//         <group position={ position }>
//             {/* <Text
//                 font="./bebas-neue-v9-latin-regular.woff"
//                 scale={ 8 }
//                 position={ [ 0, 2.25, 2 ] }
//             >
//                 FINISH
//                 <meshBasicMaterial toneMapped={ false } />
//             </Text> */}

//         <mesh 
//             receiveShadow
//             geometry={geometry}
//             material={material}
//             position={ [ 0, 0, 0 ] } 
//             scale={ [ 4, 0.2, 4 ] }
//         />

//             <RigidBody 
//              type="fixed"
//              colliders="hull"
//              restitution={ 0.2 }
//              friction={ 0 }
//              position={ [ 0, 0.25, 0 ] }
//              >
//                 <primitive  object={ cube.scene } scale={ 0.2 } />
//             </RigidBody>
//         </group>
//     )
// }