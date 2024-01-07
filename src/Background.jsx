import * as THREE from "three";
import { fragmentShader } from "./shaders/fragmentShader";
import { vertexShader } from "./shaders/vertexShader";

export default function Background() {
  return (
    <mesh position={[0, 0, 0]} scale={3}>
      <sphereGeometry args={[8, 32, 32]} />
      <shaderMaterial
         uniforms={{ time: { value: 0 } }}

        side={THREE.DoubleSide}
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
      />
    </mesh>
  );
}
