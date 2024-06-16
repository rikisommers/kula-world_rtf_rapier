import { useRef } from 'react'
import { useControls } from 'leva'

export default function Lights()
{
    const light = useRef()
    
    const world_light = useControls({
        directional_color: '#ff00d2',
        ambient_color: '#d3acff',
        ambient_intensity:1,
      })


    return <>
        <directionalLight
            ref={light}
            color={world_light.directional_color}
            position={ [ 0, 10, 1 ] }
            intensity={ .5 }
            shadow-mapSize={ [ 1024, 1024 ] }
            shadow-camera-near={ 1 }
            shadow-camera-far={ 10 }
            shadow-camera-top={ 10 }
            shadow-camera-right={ 10 }
            shadow-camera-bottom={ - 10 }
            shadow-camera-left={ - 10 }
        />
        <ambientLight
         color={world_light.ambient_color} 
        intensity={world_light.ambient_intensity } />
    </>
}