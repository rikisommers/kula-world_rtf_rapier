export default function BlockCube({
  position = [0, 0, 0],
}) {


  return (

        <mesh position={position} name="floor">
            <boxGeometry />
            <meshStandardMaterial color="mediumpurple" />
        </mesh>

  );
}

