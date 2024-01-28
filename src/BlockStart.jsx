import { RigidBody } from "@react-three/rapier";
import { playStart } from './Audio';
import { useRef } from "react";

export default function BlockStart({
  position = [0, 0, 0],
  geometry,
  material
}) {


  return (
      //  <RigidBody 
      //   type="fixed"
      //   colliders="cuboid"
      //   restitution={ 1 }
      //   friction={ 1  }
      //   position={ [ 0, 0, 0 ] }
      //   onCollisionEnter={({ manifold, target, other }) => {
      //     console.log(
      //       "start ",
      //       manifold.solverContactPoint(0),
      //      // playStart()

      //     );
    
      //     if (other.rigidBodyObject) {
      //       console.log(
      //         // this rigid body's Object3D
      //         target.rigidBodyObject.name,
      //         " collided with ",
      //         // the other rigid body's Object3D
      //         other.rigidBodyObject.name
      //       );
      //     }
      //   }}
      //   >
            <RigidBody
            //key={index}
            type="fixed"
            colliders="cuboid"
            restitution={1}
            friction={1}
            position={position}
          >
  
    <mesh 
      name="floor"
      geometry={geometry}
      material={material}

      />
        {/* <group position={position}>

          </group> */}

   </RigidBody>
  );
}
