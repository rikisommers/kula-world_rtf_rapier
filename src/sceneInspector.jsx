import { useThree } from '@react-three/fiber';
import React, { useEffect } from 'react';
import useGame from './stores/useGame';
const SceneInspector = ({ levelRef }) => {
  const { scene } = useThree();
  const setObjectPositions = useGame((state) => state.setObjectPositions);
  useEffect(() => {
    // Function to recursively traverse the scene graph and collect mesh objects
    const collectMeshObjects = (object, meshes) => {
      if (object.isMesh && object.name === 'floor') {
        meshes.push(object);
      }

      if (object.children) {
        object.children.forEach((child) => {
          collectMeshObjects(child, meshes);
        });
      }
    };

    // Collect all mesh objects in the scene
    const allMeshes = [];
    collectMeshObjects(scene, allMeshes);

    // If you have a levelRef, you can access its children as well
    if (levelRef && levelRef.current) {
      collectMeshObjects(levelRef.current, allMeshes);
    }

    // Do something with allMeshes, for example, log their properties
    setObjectPositions(allMeshes);

    console.log('99999',allMeshes);
  }, [scene, levelRef, setObjectPositions]);

  return null;
};

export default SceneInspector;