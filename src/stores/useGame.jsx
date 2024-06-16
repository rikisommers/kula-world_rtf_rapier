import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export const movementStateDict = {
  IDLE: "idle",
  FORWARD: "forward",
  BACKWARD: "backward",
  MOVE_LEFT: "move_left",
  MOVE_RIGHT: "move_right",
};




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
        startParty: () =>
          {
              set((state) =>
              {
                //  console.log('playing')
                  if(state.phase === 'ready')
                  return { phase: 'playing_party',startTime: Date.now() }
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