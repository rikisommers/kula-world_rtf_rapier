import { useControls } from "leva";
import { useEffect, useRef } from "react";

export const useAudioControls = () => {
  const audioControls = useControls({
    volume: { value: 0.2, min: 0, max: 1, step: 0.01 },
  });

  const aStart = useRef(new Audio('../audio/HIRO_00000.wav'));
  const aJump = useRef(new Audio('../audio/HIRO_00001.wav'));
  const aMove = useRef(new Audio('../audio/HIRO_00004.wav'));
  const aEnd = useRef(new Audio('../audio/HIRO_00020.wav'));
  const aPop = useRef(new Audio('./audio/HIRO_00019.wav'));
  const aLand = useRef(new Audio('./audio/HIRO_00005.wav'));
  const aCoin = useRef(new Audio('./audio/HIRO_00008.wav'));
  const aFood = useRef(new Audio('./audio/HIRO_00014.wav'));
  const aFall = useRef(new Audio('./audio/HIRO_00021.wav'));

  const playAudio = (audioRef) => {
    audioRef.current.volume = audioControls.volume;
    audioRef.current.currentTime = 0;
    audioRef.current.play();
  };


  return {
    playStart: () => playAudio(aStart),
    playJump: () => playAudio(aJump),
    playMove: () => playAudio(aMove),
    playEnd: () => playAudio(aEnd),
    playPop: () => playAudio(aPop),
    playLand: () => playAudio(aLand),
    playCoin: () => playAudio(aCoin),
    playFood: () => playAudio(aFood),
    playFall: () => playAudio(aFall),
  };
};