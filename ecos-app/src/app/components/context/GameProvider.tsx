'use client'

import React, { useState } from "react"

export const GameContext = React.createContext<{ time: number, started: boolean, startTimer: () => void, stopTimer: () => void }>({
    time: 0,
    started: false,
    startTimer: () => {},
    stopTimer: () => {}
})

export default function GameProvider({ children } : { children: React.ReactNode }) {

    const [time, setTime] = useState<number>(0)
    const [started, setStarted] = useState<boolean>(false)
    const [id, setId] = useState<NodeJS.Timeout>()

    function startTimer() {
        if (id !== undefined)
            clearInterval(id)

        setId(setInterval(() => {
            setTime((prevTime) => prevTime + 1)
        }, 1000))

        setStarted(true)
    }

    function stopTimer() {
        if (id !== undefined)
            clearInterval(id)
        setTime(0)
        setStarted(false)
    }

    return (
        <GameContext.Provider value={ { time: time, started: started, startTimer: startTimer, stopTimer: stopTimer } }>
            {children}
        </GameContext.Provider>
    )
}