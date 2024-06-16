import { RigidBody } from "@react-three/rapier";
import { useRef } from "react";

export default function BlockStart({
  position = [0, 0, 0],
  geometry,
  material
}) {


  return (
     
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
       

   </RigidBody>
  );
}
