'use client'

import { useEffect, useState } from "react";

// Store and clear an error string, optionally specify seconds until error clears (default 8s)
export default function useError(initialValue?: string, clearTimeout?: number): [string, (error: string) => void] {
    const [error, setError] = useState<string>(initialValue ? initialValue : '')
    const [timeout, setTimeout] = useState<number | undefined>()

    function throwError(error: string) {
        setError(error)

        if (timeout)
            window.clearTimeout(timeout)

        setTimeout(window.setTimeout(() => {
            setError('')
            setTimeout(undefined)
        }, (clearTimeout ? clearTimeout * 1000 : 8000)))
    }

    useEffect(() => {
        if (initialValue && initialValue !== '')
            throwError(initialValue)
    })

    return [error, throwError]
}