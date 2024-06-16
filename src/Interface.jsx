import { useKeyboardControls } from '@react-three/drei'
import { useEffect, useRef, useState } from 'react'
import { Canvas, addEffect } from '@react-three/fiber'
import useGame from './stores/useGame.jsx'
import * as THREE from "three";

export default function Interface() {
    const time = useRef()
    const restart = useGame((state) => state.restart)
    const phase = useGame((state) => state.phase)
    const [countdown, setCountdown] = useState(120) // 2 minutes in seconds

    const forward = useKeyboardControls((state) => state.forward)
    const backward = useKeyboardControls((state) => state.backward)
    const leftward = useKeyboardControls((state) => state.leftward)
    const rightward = useKeyboardControls((state) => state.rightward)
    const jump = useKeyboardControls((state) => state.jump)

    const controls = useKeyboardControls((state) => state)

    useEffect(() => {
        let interval

        if (phase === 'playing') {
            interval = setInterval(() => {
                setCountdown((prevCountdown) => {
                    if (prevCountdown <= 1) {
                        clearInterval(interval)
                        // Trigger end of the game logic here
                        useGame.getState().end()
                        return 0
                    }
                    return prevCountdown - 1
                })
            }, 1000)
        }

        return () => {
            if (interval) {
                clearInterval(interval)
            }
        }
    }, [phase])

    useEffect(() => {
        const unsubscribeEffect = addEffect(() => {
            const state = useGame.getState()
            let elapsedTime = 0
            if (state.phase === 'playing') {
                elapsedTime = Date.now() - state.startTime
            } else if (state.phase === 'ended') {
                elapsedTime = state.endTime - state.startTime
            }
            elapsedTime /= 1000
            elapsedTime = elapsedTime.toFixed(2)

            if (time.current) {
                const minutes = Math.floor(countdown / 60)
                const seconds = countdown % 60
                time.current.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`
            }
        })

        return () => {
            unsubscribeEffect()
        }
    }, [countdown])

    return (
        <>
            <div className="interface">
                <div ref={time} className="time">2:00sss</div>
                {phase === 'ended' && <div className="restart" onClick={restart}>Restart</div>}
  
                <div className="controls">
                    <div className="raw">
                        <div className={`key ${forward ? 'active' : ''}`}></div>
                    </div>
                    <div className="raw">
                        <div className={`key ${leftward ? 'active' : ''}`}></div>
                        <div className={`key ${backward ? 'active' : ''}`}></div>
                        <div className={`key ${rightward ? 'active' : ''}`}></div>
                    </div>
                    <div className="raw">
                        <div className={`key large ${jump ? 'active' : ''}`}></div>
                    </div>
                </div>
            </div>
        </>
    )
}
