import "./style.css";
import ReactDOM from "react-dom/client";
import { Canvas } from "@react-three/fiber";
import { KeyboardControls, Environment, Billboard } from "@react-three/drei";
import Experience from "./Experience.jsx";
import Interface from "./Interface.jsx";
import { AxesHelper } from "three";
import {
  Bloom,
  DepthOfField,
  EffectComposer,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import { Perf } from "r3f-perf";
import { Stats, OrbitControls } from "@react-three/drei";
import { useControls } from "leva"; 



const root = ReactDOM.createRoot(document.querySelector("#root"));

root.render(
  <KeyboardControls
    map={[
      { name: "forward", keys: ["ArrowUp", "KeyW"] },
      { name: "backward", keys: ["ArrowDown", "KeyS"] },
      { name: "leftward", keys: ["ArrowLeft", "KeyA"] },
      { name: "rightward", keys: ["ArrowRight", "KeyD"] },
      { name: "jump", keys: ["Space"] },
    ]}
  >
 

    <Canvas
      shadows="false"
      // camera={{
      //   fov: 70,
      //   near: 1,
      //   far: 10,
      //   position: [1, 1, 1],
        
      // }}
    >
    
      <Experience />
      <Stats/>
   

      <Perf position="bottom-left" />

      <axesHelper args={[1]} />
      <color attach="background" args={['#7600ff']} />

    </Canvas>
    <Interface />
  </KeyboardControls>
);
