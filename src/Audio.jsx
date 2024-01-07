import * as THREE from 'three'


const aStart = new Audio('../audio/HIRO_00000.wav')
const aEnd = new Audio('../audio/HIRO_00020.wav')
const aPop = new Audio('./audio/HIRO_00019.wav')
const aLand = new Audio('./audio/HIRO_00005.wav')
const aCoin = new Audio('./audio/HIRO_00008.wav')
const aFood = new Audio('./audio/HIRO_00014.wav')
const aFall = new Audio('./audio/HIRO_00021.wav')

export const playStart = () =>
{
    aStart.volume = 0.5
    aStart.currentTime = 0
    aStart.play()
}

export const playEnd = () =>
{
    aEnd.volume = 0.5
    aEnd.currentTime = 0
    aEnd.play()
}

export const playPop = () =>
{
    aPop.volume = 0.5
    aPop.currentTime = 0
    aPop.play()
}

export const playLand = () =>
{
    aLand.volume = 0.5
    aLand.currentTime = 0
    aLand.play()
}

export const playCoin = () =>
{
    aCoin.volume = 0.5
    aCoin.currentTime = 0
    aCoin.play()
}

export const playFood = () =>
{
    aFood.volume = 0.5
    aFood.currentTime = 0
    aFood.play()
}

export const playFall = () =>
{
    aFall.volume = 0.5
    aFall.currentTime = 0
    aFall.play()
}