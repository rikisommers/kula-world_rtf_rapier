import * as THREE from 'three'
import { useRapier, RigidBody, quat, vec3, euler  } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { useKeyboardControls, useGLTF,  PivotControls, TransformControls, OrbitControls } from '@react-three/drei'
import { useEffect, useRef ,useState} from 'react'
import useGame from './stores/useGame.jsx'
import { useControls } from 'leva'
import { degToRad } from 'three/src/math/MathUtils.js'
import { gsap } from 'gsap';

export default function Player()
{

    const ball = useGLTF("./ball1.glb");

    const start = useGame((state) => state.start)
    const end = useGame((state) => state.end)
    const restart = useGame((state) => state.restart)
    const blocksCount = useGame((state) => state.blocksCount)

    const body = useRef()
    const player = useRef()
    //const { body } = useRigidBody();


    const [ subscribeKeys, getKeys ] = useKeyboardControls()
    const { rapier, world } = useRapier()



    const { scale, rotateY } = useControls('player', {
        scale:
        {
            value: 1.5,
            step: 0.01,
            min: 0,
            max: 5
        },
        rotateY:
        {
            options: [ 0, 90, 180]
        }
    })


    // const { quaternion, position } = useControls('camera', {
    //     quarternion:
    //     {
    //         w: 0,
    //         x: 0,
    //         y: 0,
    //         z: 0
    //     },
    //     position:
    //     {
    //         x:2.5,
    //         y:4,
    //         z:6
    //     }
    // })
      

    //lerp pos
    //const [ smoothedCameraPosition ] = useState(() => new THREE.Vector3())

    //set cam back
    const [ smoothedCameraPosition ] = useState(() => new THREE.Vector3(10, 10, 10))
    const [ smoothedCameraTarget ] = useState(() => new THREE.Vector3())
    const [ playerRotation,setPlayerRotation ] = useState(0);

    const blockLength = 1; // Length of 1 block

    
    const jump = () =>
    {
       //console.log('Yes, jump!')
        const origin = body.current.translation()
        origin.y -= 0.31
        const direction = { x: 0, y: - 1, z: 0 }
        const ray = new rapier.Ray(origin, direction)
        const hit = world.castRay(ray, 10, true)
        
        //console.log(hit.toi)
        if(hit.toi < 0.15)
        body.current.applyImpulse({ x: 0, y: 0.5, z: 0 })

    }


    // const rotationInRadians = (playerRotation + 90) * (Math.PI / 180);
    // setPlayerRotation(rotationInRadians);
    // const newRotation = quat.fromEuler(0, Math.PI / 2, 0);
    // body.current.setRotation({ w: 1.0, x: 0.0, y: 0.0, z: 0.0})
    //console.log(player.current.rotation.isEuler )

  
    const move = () =>
    {
        // const impulseStrength = 2.6 * delta
        // const torqueStrength = 2.2 * delta
        // impulse.z -= impulseStrength
        // torque.x -= torqueStrength      
        // body.current.applyImpulse(impulse)
        //body.current.applyImpulse({ x: 0, y: 0, z: -1 })
     //   const force = new THREE.Vector3(0, 0, -blockLength); // Adjust the force direction
      //  body.current.addForce(force);

        const targetPos = player.current.position.z - 1;


        console.log(player.current.position)
        gsap.to(player.current.position, {
            z: targetPos,
            duration: 0.5,
            ease: 'power2.out',
        });

    }


    const moveBack = () =>
    {
        // const impulseStrength = 2.6 * delta
        // const torqueStrength = 2.2 * delta
        // impulse.z -= impulseStrength
        // torque.x -= torqueStrength      
        // body.current.applyImpulse(impulse)
        //body.current.applyImpulse({ x: 0, y: 0, z: -1 })
        const force = new THREE.Vector3(0, 0, blockLength); // Adjust the force direction
        body.current.addForce(force);

        const targetPos = player.current.position.z +1;

        // if(player.current.position === targetPos){
        //     body.current.addForce(-force)

        // }

        // console.log(player.current.position)
        // gsap.to(player.current.position, {
        //     z: targetPos,
        //     duration: 0.5,
        //     ease: 'power2.out',
        // });

    }

    // While Rapier's return types need conversion, setting values can be done directly with Three.js types
 


    const turnLeft = () => {
        console.log('going left!');
        const targetAngle = player.current.rotation.y + degToRad(90);
        //console.log('cam', state.camera)
        console.log('player',player)
        console.log('body',body)

        gsap.to(player.current.rotation, {
            y: targetAngle,
            duration: 0.5,
            ease: 'power2.out',
        });


        // body.current.setTranslation(position, true);
        // body.current.setRotation(quaternion, true);
  
        //const torque = { x: 0, y: 0.1, z: 0 }; // Adjust the torque values as needed
        //body.current.applyTorqueImpulse({ x: 0, y: 0.01, z: 0 })

        
    };



    const turnRight = () =>
    {
        console.log('going right!')
        const targetAngle = player.current.rotation.y - degToRad(90);

        gsap.to(player.current.rotation, {
            y: targetAngle,
            duration: 0.5,
            ease: 'power2.out',
        });

        //body.current.applyTorqueImpulse({ x: 0, y: -0.01, z: 0 })

    }

    
    const reset = () =>
    {
        body.current.setTranslation({ x: 0, y: 1, z: 0 })
        body.current.setLinvel({ x: 0, y: 0, z: 0 })
        body.current.setAngvel({ x: 0, y: 0, z: 0 })
    }

    useEffect(() =>
    {
   
        const unsubscribeReset = useGame.subscribe(
            (state) => state.phase,
            (value) =>
            {
                if(value === 'ready' | 'ended')
                  // console.log('reset')
                    reset()
            }
        )


        const unsubscribeAny = subscribeKeys(
            () =>
            {
                //console.log('start')
                start()
            }
        )


        const unsubscribeBack = subscribeKeys(
            (state) => state.backward,
            (value) =>
            {
               if(value)
                   moveBack()
            }
        )
                
                 
        const unsubscribeForward = subscribeKeys(
            (state) => state.forward,
            (value) =>
            {
               if(value)
                   move()
            }
        )


        const unsubscribeLeft = subscribeKeys(
            (state) => state.leftward,
            (value) =>
            {
               if(value)
                   turnLeft()
            }
        )


        const unsubscribeRight = subscribeKeys(
            (state) => state.rightward,
            (value) =>
            {
               if(value)
                   turnRight()
            }
        )


    
        const unsubscribeJump = subscribeKeys(
            (state) => state.jump,
            (value) =>
            {
                if(value)
                    jump()
            }
        )
        return () =>
        {
            unsubscribeJump()
            unsubscribeForward()
            unsubscribeBack()
            unsubscribeLeft()
            unsubscribeRight()
            unsubscribeAny()
            unsubscribeReset()


        }

    }, [])

    const [canMoveForward, setCanMoveForward] = useState(true);
    const [forwardIncrement, setForwardIncrement] = useState(0);


    useFrame((state, delta) =>
    {
         

    const position = vec3(body.current.translation());
    const quaternion = quat(body.current.rotation());
    const eulerRot = euler().setFromQuaternion(
      quat(body.current.rotation())
    );


             const cameraPosition = new THREE.Vector3()
          

          //body.current.position()

          const bodyPosition = body.current.translation()
        //   // console.log(bodyPosition)
        //   const bodyRotation = body.current.rotation()

  
        //   const cameraPosition = new THREE.Vector3()
        //   cameraPosition.copy(bodyPosition)
        //   cameraPosition.z += 2.25
        //   cameraPosition.y += 0.65
  

        //   const cameraRotation = new THREE.Vector3()


        //   const cameraTarget = new THREE.Vector3()
        //  // cameraTarget.copy(bodyRotation)
        //   cameraTarget.y += 0.25
        
  
        //   // smoothedCameraPosition.lerp(cameraPosition, 0.1)
        //   // smoothedCameraTarget.lerp(cameraTarget, 0.1)
  
        //   //fix speed for frame rate
        //   smoothedCameraPosition.lerp(cameraPosition, 5 * delta)
        //   smoothedCameraTarget.lerp(cameraTarget, 5 * delta)
          
        //   state.camera.position.copy(smoothedCameraPosition)
        //   //state.camera.rotation.copy(bodyRotation)

        //   state.camera.lookAt(smoothedCameraTarget)
          


        //console.log(player.current.rotation.z)
        const { forward, backward, leftward, rightward } = getKeys()
        
        const impulse = { x: 0, y: 0, z: 0 }
        //const impulse = { x: 0.001, y: 0, z: 0 }
        const torque = { x: 0, y: 0, z: 0 }



        if(forward)
        {

          }
              
        if(leftward)
        {

            console.log(body.current)


            //rotateTo90Degrees();
            console.log(state.camera)
            //impulse.x -= impulseStrength
            //turnLeft()
        }
    
        if(rightward)
        {
            //impulse.x -= impulseStrength

        }
     
        // body.current.applyTorqueImpulse(torque)
       
    //    if(bodyPosition.y < - 10)
    //    restart()
    //     console.log('AAAAHHHH!!!')

    })

    return (
     
     
        
            <group ref={player}>
          
                
                <mesh castShadow ref={player} scale={player.scale}>
                    <boxGeometry args={[0.3, 1]} />
                    <meshStandardMaterial flatShading color="mediumpurple" />
                </mesh>
                {/* <RigidBody 
            ref={body}
            position={ [ 0, 1, 0 ] }
            canSleep={ false } 
            colliders="ball"
            
            enabledRotations={[true,true,true]}
            mass={100}
            restitution={ 0.01 } 
            friction={ 100 } 
            linearDamping={ 10.5 }
            angularDamping={ 0.5 } 
            >
            </RigidBody>  */}
            </group>
   
    )
}