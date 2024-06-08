import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useControls } from 'leva'

export default function Lights()
{
    const light = useRef()
    
    const color = useControls({
        directional_color: '#00ff9f',
        ambient_color: '#7600ff',
      })


    return <>
        <directionalLight
            ref={light}
            color={color.directional_color}
            position={ [ 0, 6, 1 ] }
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
         color={color.ambient_color} 
 intensity={ 0.5 } />
    </>
}