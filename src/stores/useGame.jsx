import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export const movementStateDict = {
  IDLE: "idle",
  FORWARD: "forward",
  BACKWARD: "backward",
  MOVE_LEFT: "move_left",
  MOVE_RIGHT: "move_right",
};

const dist = 5;

export const playerMovementTop = [
  { x: 0, y: 0, z: -dist }, // Forward
  { x: -dist, y: 0, z: 0 }, // Move Left
  { x: 0, y: 0, z: dist }, // Backward
  { x: dist, y: 0, z: 0 }, // Move Right
];

export const playerMovementTopDict = {
  forward: { x: 0, y: 0, z: -dist }, // Forward
  left: { x: -dist, y: 0, z: 0 }, // Move Left
  back: { x: 0, y: 0, z: dist }, // Backward
  right: { x: dist, y: 0, z: 0 }, // Move Right
};

export const gravityDirectionDict = {
  top: [0, -10, 0], // Top face
  bottom: [0, 100, 0], // Bottom face
  right: [-100, 0, 0], // Right face
  left: [100, 0, 0], // Left face
  front: [0, 0, 100], // Front face
  back: [0, 0, -100], // Back face
}


export const cameraDirectionsTopDict = {
  forward: { x: 0, y: 1, z: 3 }, // Forward
  left: { x: 3, y: 1, z: 0 }, // Move Left
  back: { x: 0, y: 1, z: -3 }, // Backward
  right: { x: -3, y: 1, z: 0 }, // Move Right
};

export const cameraDirectionsFrontDict = {
  forward: { x: 0, y: 3, z: 0 }, // Forward
  left: { x: 0, y: 1, z: 3 }, // Move Left
  back: { x: 0, y: -3, z: 0 }, // Backward
  right: { x: 0, y: 1, z: -3 }, // Move Right
};

export const cameraDirectionsTop = [
  { x: 0, y: 1, z: 3 }, // Forward
  { x: 3, y: 1, z: 0 }, // Move Left
  { x: 0, y: 1, z: -3 }, // Backward
  { x: -3, y: 1, z: 0 }, // Move Right
];
export const cameraDirectionsFront = [
  { x: 0, y: 3, z: 0 }, // Forward
  { x: 0, y: 1, z: 3 }, // Move Left
  { x: 0, y: -3, z: 0 }, // Backward
  { x: 0, y: 1, z: -3 }, // Move Right
];

export default create(subscribeWithSelector((set) =>
{



    return {
        objectPositions: [],
        blocksCount: 10,
        blocksSeed: 0,
        phase: 'ready',
        startTime: 0,
        endTime: 0,
        rotation: [0, 0, 0],
        gravityDirection: gravityDirectionDict.top,
        cameraDirection: [cameraDirectionsTopDict.forward],
        playerMovementTop: playerMovementTop,
        cameraDirectionsTop: cameraDirectionsTopDict,
        cameraDirectionsFront: cameraDirectionsFrontDict,

       
        setObjectPositions: (newPos) => {
          set({ objectPositions: newPos });
        },

        // Function to set the rotation
        setRotation: (newRotation) => {
          set({ rotation: newRotation });
        },
    
        // Function to get the rotation
        getRotation: () => {
          return this.getState().rotation;
        },
        
        start: () =>
        {
            set((state) =>
            {
              //  console.log('playing')
                if(state.phase === 'ready')
                return { phase: 'playing',startTime: Date.now() }
                return {}
            })
        },

        restart: () =>
        {
            set((state) =>
            {
                console.log('ready')
                if(state.phase === 'playing' || state.phase === 'ended')
                return { phase: 'ready', blocksSeed: Math.random() }
                return {}
            })
        },

        end: () =>
        {
            set((state) =>
            {
                console.log('end')
                if(state.phase === 'playing')
                return { phase: 'ended', endTime: Date.now() }
                return {}
            })
        },


        // ------------------------------ GRAVITY


        setGravityDirection: (newGravityDirection) => {
          set({ gravityDirection: newGravityDirection });
        },

       // ------------------------------ CAMERA

       setCameraDirection: (newCameraDirection) => {
        set({ cameraDirection: newCameraDirection });
      },
    }
}))