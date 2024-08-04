import * as THREE from "three";
import { useMemo, useState, useRef, useEffect, Suspense } from "react";
import Block from "./Block";
import Player from "./Player";
import useGame from "./stores/useGame.jsx";
import { Physics } from "@react-three/rapier";
import SceneInspector from "./sceneInspector.jsx";
import Background from "./Background.jsx";
import { Environment } from '@react-three/drei'
import { Cloud, OrbitControls, Sky , StatsGl } from "@react-three/drei";
import { useControls } from "leva";


export default function Level({
  count,
  seed = 0,
  types = [Block],
}) {

const level = useRef();
const meshObjectsRef = useRef([]);


const o = [[0,1,0],[0,0,1],[1,0,0]]


  const blocks = useMemo(() => {
    const blocks = [];

    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      blocks.push(type);
    }

    return blocks;
  }, [count, types, seed]);

     const gravityDirection = useGame((state) => state.gravityDirection);


  const positions = [

    [0, -1, -4, "cube",'e', true], 
    [0, -1, -5, "cube",'c'],
    [0, -1, -6, "cube",'c'],
    [0, -1, -7, "cube",'c'],  
    [0, -1, -8, "cube",'e',true],
    [0, -1, -9, "cube",'c'],
    [0, -1, -10, "cube",'c'],
    [0, -1, -11, "cube",'c'],
    [0, 0, -12, "cube",'c'],
    [0, 1, -12, "cube",'c'],
    [0, 2, -12, "cube",'c'],
    [0, 3, -12, "cube",'c'],
    [0, 4, -12, "cube",'c'],
    [0, 5, -12, "cube",'c'],


    [0, -1, -12, "key",'c'],
    [0, -1, -13, "cube",'c'],
    [2, -1, -13, "cube",'c'],
    [3, -1, -13, "cube",'c'],
    [4, -1, -13, "cube",'c'],
    [5, -1, -13, "cube",'c'],
    [6, -1, -13, "key",'c'],
    [6, -2, -13, "cube",'c'],
    [6, -3, -13, "cube",'c'],
    [6, -4, -13, "cube",'c'],


    [1, -6, -8, "cube",'c'],
    [2, -6, -8, "cube",'c'],
    [3, -6, -8, "cube",'c'],
    [4, -6, -8, "cube",'c'],
    [5, -6, -8, "cube",'c'],


    [1, -6, -9, "cube",'e'],
    [2, -6, -9, "cube",'e'],
    [3, -6, -9, "cube",'e'],
    [4, -6, -9, "key",'g'],
    [5, -6, -9, "cube",'e'],

    [1, -6, -10, "cube",'e'],
    [2, -6, -10, "cube",'e'],
    [3, -6, -10, "cube",'e'],
    [4, -6, -10, "cube",'e'],
    [5, -6, -10, "cube",'e'],


    /// Top face (y = -1)

    // [0, -1, 0, "start",'c'], 
    // [0, -1, -1, "cube",'c'],
    // [0, -1, -2, "cube",'c'],
    
    [0, -1, 0, "start",'c'], 
    [0, -1, -1, "cube",'c'],
    [0, -1, -2, "cube",'c'],
    [0, -1, -3, "cube",'c'], 
    [1, -1, 0, "cube",'c'],
    [1, -1, -1, "cube",'c'],
    [1, -1, -2, "cube",'c'],
    [1, -1, -3, "cube",'c'],
    [2, -1, 0, "cube",'c'],
    [2, -1, -1, "cube",'c'],
    [2, -1, -2, "cube",'c'],
    [2, -1, -3, "cube",'c'],
    [-1, -1, 0, "cube",'c'],
    [-1, -1, -1, "cube",'c'],
    [-1, -1, -2, "cube",'c'],
    [-1, -1, -3, "cube",'c'], 

    // end
    [-2, -1, 0, "cube",'c'],
    [0, -1, 0, "cube",'c'],

    //
    
    [-2, -1, -1, "cube",'c'],
    [-2, -1, -2, "cube",'c'],
    [-2, -1, -3, "cube",'c'],

    /// Bottom face (y = -3)
    [0, -5, 0, "cube",'c'], 
    [0, -5, -1, "cube",'c'],
    [0, -5, -2, "cube",'c'],
    [0, -5, -3, "cube",'c'],  
    [1, -5, 0, "cube",'c'],
    [1, -5, -1, "cube",'c'],
    [1, -5, -2, "cube",'c'],
    [1, -5, -3, "cube",'c'],
    [2, -5, 0, "cube",'c'],
    [2, -5, -1, "cube",'c'],
    [2, -5, -2, "cube",'c'],
    [2, -5, -3, "cube",'c'],
    [-1, -5, 0, "cube",'c'],
    [-1, -5, -1, "cube",'c'],
    [-1, -5, -2, "cube",'c'],
    [-1, -5, -3, "cube",'c'], 
    [-2, -5, 0, "cube",'c'],
    [-2, -5, -1, "cube",'c'],
    [-2, -5, -2, "cube",'c'],
    [-2, -5, -3, "cube",'c'],

    /// Front face (z = 0)
    // [0, -2, 0, "cube"], 
    // [1, -2, 0, "cube"],
    // [2, -2, 0, "cube"],
    // [-1, -2, 0, "cube"],
    // [-2, -2, 0, "cube"],
    // [0, -3, 0, "cube"], 
    // [1, -3, 0, "cube"],
    // [2, -3, 0, "cube"],
    // [-1, -3, 0, "cube"],
    // [-2, -3, 0, "cube"],

    /// Back face (z = -3)
    // [0, -2, -3, "cube"], 
    // [1, -2, -3, "cube"],
    // [2, -2, -3, "cube"],
    // [-1, -2, -3, "cube"],
    // [-2, -2, -3, "cube"],
    // [0, -3, -3, "cube"], 
    // [1, -3, -3, "cube"],
    // [2, -3, -3, "cube"],
    // [-1, -3, -3, "cube"],
    // [-2, -3, -3, "cube"],

    /// Left face (x = -2)
    // [-2, -2, 0, "cube"], 
    // [-2, -2, -1, "cube"],
    // [-2, -2, -2, "cube"],
    // [-2, -3, 0, "cube"], 
    // [-2, -3, -1, "cube"],
    // [-2, -3, -2, "cube"],

    /// Right face (x = 2)
    // [2, -2, 0, "cube"], 
    // [2, -2, -1, "cube"],
    // [2, -2, -2, "cube"],
    // [2, -3, 0, "cube"], 
    // [2, -3, -1, "cube"],
    // [2, -3, -2, "cube"],
];

// const CheckerboardMaterial = ({ backgroundColor }) => {
//   const materialRef = useRef();
  
//   const vertexShader = `
//     varying vec2 vUv;
//     void main() {
//       vUv = uv;
//       gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//     }
//   `;

//   const fragmentShader = `
//     uniform float iTime;
//     uniform vec2 iResolution;
//     varying vec2 vUv;
    
//     float checkerboard(in vec2 uv, in vec2 subdivisions) {
//       vec2 c = mod(floor(uv * subdivisions), 2.0);
//       return float(c.x == c.y);
//     }
    
//     void main() {
//       vec2 uv = vUv;

//       // Time varying pixel color
//       vec3 col = 0.5 + 0.5 * cos(iTime + uv.xyx + vec3(0.0, 2.0, 4.0));
      
//       col *= 0.5 + 0.5 * checkerboard(uv, vec2(8.0 * iResolution.x / iResolution.y, 8.0));

//       // Output to screen
//       gl_FragColor = vec4(col, 1.0);
//     }
//   `;

//   useEffect(() => {
//     if (materialRef.current) {
//       materialRef.current.uniforms.iResolution.value = new THREE.Vector2(window.innerWidth, window.innerHeight);
//     }
//   }, []);

//   // useFrame(({ clock }) => {
//   //   if (materialRef.current) {
//   //     materialRef.current.uniforms.iTime.value = clock.getElapsedTime();
//   //   }
//   // });

//   return (
//     <shaderMaterial
//       ref={materialRef}
//       side={THREE.BackSide}
//       transparent={true}
//       opacity={0.8}
//       depthWrite={false}
//       uniforms={{
//         iTime: { value: 0 },
//         iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
//       }}
//       vertexShader={vertexShader}
//       fragmentShader={fragmentShader}
//     />
//   );
// };
const { backgroundColor } = useControls({
  backgroundColor: { value: '#f9beff', label: 'World Background Color' },
});





// function TransparentEnvironment() {
//   const materialRef = useRef()
//   return (
//       <mesh>
//           <sphereGeometry args={[100, 64, 64]} />
//           {/* <meshStandardMaterial
//               ref={materialRef}
//               side={THREE.BackSide}
//               transparent={true}
//               opacity={0.8}
//               depthWrite={false}
//               color={new THREE.Color([backgroundColor])}
//           /> */}
//                   <CheckerboardMaterial />

//       </mesh>
//   )
// }

  


  return (
    <Physics debug={true} gravity={gravityDirection} shadows>

      <SceneInspector levelRef={level} />

      <Player
        objects={meshObjectsRef.current}
        blocks={blocks}
        positions={positions}
      />
      <StatsGl />


      {/* <Sky /> */}

       
{/* <TransparentEnvironment /> */}
{/* <Environment preset="forest" background blur={0.1}  /> */}

      <Background />
      <group ref={level}>
        {positions.map((position, index) => (
            <Block
              key={index}
              position={position.slice(0, 3)}
              blockType={position[3]}
              material={position[4]}
              hasCoin={position[5]}
              hasKey={position[6]}
            />
        ))}
      </group>
      </Physics>
  );
}
