import { useGLTF } from "@react-three/drei";

export default function BlockCube({ position = [0, 0, 0] }) {
  const cube = useGLTF("./cube1.glb");
  cube.scene.traverse(function (node) {
    if (node.isMesh) {
      node.receiveShadow = true;
    }
  });

  return (
    <mesh position={position} name="floor">
      {/* <boxGeometry />
            <meshStandardMaterial color="mediumpurple" /> */}

      <primitive
        receiveShadow // Add this line to enable shadow reception
        castShadow // Add this line to enable casting shadows
        object={cube.scene.clone()} // Clone the scene for each instance
        scale={0.50}
        //  position={position}
      />
    </mesh>
  );
}
