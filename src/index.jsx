import "./style.css";
import ReactDOM from "react-dom/client";
import { useEffect } from "react";

import { Canvas , useThree} from "@react-three/fiber";
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
import * as THREE from "three";
// Component to add fog to the scene
const AddFog = () => {
  const { scene } = useThree();

  useEffect(() => {
    //scene.fog = new THREE.FogExp2(0xff00d2, 0.05); // Exponential fog
     scene.fog = new THREE.Fog(0xefd1b5, 3, 6); // Linear fog (alternative)
  }, [scene]);

  return null;
};



function MainComponent() {


  return (
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
                {/* <AddFog /> */}

        <Experience />
        <Stats />
        <Perf position="bottom-left" />
        <axesHelper args={[1]} />

      </Canvas>
      <Interface />
    </KeyboardControls>
  );
}

const root = ReactDOM.createRoot(document.querySelector("#root"));
root.render(<MainComponent />);
