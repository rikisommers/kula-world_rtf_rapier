import { RigidBody } from "@react-three/rapier";
import useGame from './stores/useGame.jsx'
import { playPop } from './Audio';


export default function BlockEnemy({
  position = [0, 0, 0],
  geometry,
  material
}) {

  const restart = useGame((state) => state.restart)


  return (
    <group position={position}>
    <RigidBody 
    type="fixed"
    colliders="cuboid"
    restitution={ 1 }
    friction={ 1  }
    position={ [ 0, 0, 0 ] }
    onCollisionEnter={({ manifold, target, other }) => {
      console.log(
        "enemy ",
      //  manifold.solverContactPoint(0),

      );
      playPop(),
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
    <mesh 
      receiveShadow
      geometry={geometry}
      material={material}
      />
</RigidBody>
    </group>
  );
}
