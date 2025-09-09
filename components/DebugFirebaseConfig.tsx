"use client"

import { useEffect, useState } from 'react'

export function DebugFirebaseConfig() {
    const [config, setConfig] = useState<any>({})

    useEffect(() => {
        setConfig({
            NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
            NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
            NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
            NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        })
    }, [])

    if (process.env.NODE_ENV === 'production') {
        return null
    }

    return (
        <div className="fixed top-4 right-4 bg-black text-white p-4 text-xs rounded z-50 max-w-md overflow-auto">
            <div className="font-bold mb-2">Firebase Config Debug</div>
            {Object.entries(config).map(([key, value]) => (
                <div key={key} className="mb-1">
                    <strong>{key}:</strong> {value ? '✅' : '❌'} {value ? `${String(value).substring(0, 20)}...` : 'undefined'}
                </div>
            ))}
        </div>
    )
}
