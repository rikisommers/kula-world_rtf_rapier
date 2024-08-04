import { useRef, useEffect, useState, Suspense } from "react";
import { Physics } from "@react-three/rapier";
import Lights from "./Lights.jsx";
import Level from "./Level.jsx";
import useGame from "./stores/useGame.jsx";

export default function Experience() {

  const blocksCount = useGame((state) => state.blocksCount);
  const blocksSeed = useGame((state) => state.blocksSeed);

  return (
    <>
      {/* <Timer/> */}

      <Suspense>
        <group> 

          <Lights />
          <Level
            count={blocksCount}
            seed={blocksSeed}
          />

          </group>

      </Suspense>
    </>
  );
}
