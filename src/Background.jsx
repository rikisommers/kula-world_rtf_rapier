import * as THREE from "three";
import { Cloud, OrbitControls, Sky , StatsGl } from "@react-three/drei";
import {  Suspense } from "react";

// import { fragmentShader } from "./shaders/fragmentShader";
// import { vertexShader } from "./shaders/vertexShader";

const SKY_COLOR = 0x999999;
const GROUND_COLOR = 0x242424;

const vertexShader = `
varying vec3 vWorldPosition;
void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const fragmentShader = `
uniform vec3 topColor;
uniform vec3 bottomColor;
varying vec3 vWorldPosition;
void main() {
  float h = normalize(vWorldPosition).z;
  gl_FragColor = vec4(mix(bottomColor, topColor, max(h, 0.0)), 1.0);
}`;


const AddFog = () => {
  const { scene } = useThree();

  useEffect(() => {
    //scene.fog = new THREE.FogExp2(0xff00d2, 0.05); // Exponential fog
     scene.fog = new THREE.Fog(0xefd1b5, 3, 6); // Linear fog (alternative)
  }, [scene]);

  return null;
};



export default function Background() {

 

  
  return (
    <>

          <Sky />

       
{/* <TransparentEnvironment /> */}
{/* <Environment preset="forest" background blur={0.1}  /> */}

   <Sky />
    <Suspense fallback={null}>
          <Cloud position={[-4, -2, -25]} speed={0.2} opacity={1} />
          {/* <Cloud position={[4, 2, -15]} speed={0.2} opacity={0.5} />
          <Cloud position={[-4, 2, -10]} speed={0.2} opacity={1} />
          <Cloud position={[4, -2, -5]} speed={0.2} opacity={0.5} />
          <Cloud position={[4, 2, 0]} speed={0.2} opacity={0.75} /> */}
      </Suspense>


   {/* <mesh>
      <sphereGeometry args={[8, 32, 32]} />
      <shaderMaterial
        uniforms={{
          topColor: { value: new THREE.Color(SKY_COLOR) },
          bottomColor: { value: new THREE.Color(GROUND_COLOR) }
        }}
        side={THREE.BackSide}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>  */}
    </>
  );
}
