import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth'
import { logger } from './logger'

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCRvHTCK9zM003dD1zVKtROLHgJ5g9w7Uc',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'grofast-d0e12.firebaseapp.com',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'grofast-d0e12',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'grofast-d0e12.firebasestorage.app',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '830242192750',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:830242192750:web:15f966e73d78a407d9557f',
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-92EPBN1RL1'
}

// Validate Firebase configuration
const requiredConfig = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
]

// Check if we have valid Firebase configuration
const hasValidConfig = firebaseConfig.apiKey && 
    firebaseConfig.authDomain && 
    firebaseConfig.projectId &&
    !firebaseConfig.apiKey.startsWith('your_') &&
    !firebaseConfig.authDomain.startsWith('your_') &&
    !firebaseConfig.projectId.startsWith('your_')

const isDevelopment = process.env.NEXT_PUBLIC_ENV === 'development'

if (!hasValidConfig) {
    const configStatus = {
        apiKey: !!firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith('your_'),
        authDomain: !!firebaseConfig.authDomain && !firebaseConfig.authDomain.startsWith('your_'),
        projectId: !!firebaseConfig.projectId && !firebaseConfig.projectId.startsWith('your_')
    }
    
    if (isDevelopment) {
        logger.warn('Firebase configuration invalid in development mode. Google Sign-In will be disabled.', { configStatus, firebaseConfig })
    } else {
        logger.error('Invalid Firebase configuration', { configStatus })
        throw new Error(`Invalid Firebase configuration. Check: ${Object.entries(configStatus).filter(([,valid]) => !valid).map(([key]) => key).join(', ')}`)
    }
}

// Initialize Firebase (only if configuration is valid)
let app: any = null
let auth: any = null
let googleProvider: any = null

if (hasValidConfig) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
    auth = getAuth(app)

    // Configure Google Auth Provider
    googleProvider = new GoogleAuthProvider()
    googleProvider.addScope('email')
    googleProvider.addScope('profile')
    googleProvider.setCustomParameters({
        prompt: 'select_account'
    })
} else if (isDevelopment) {
    logger.warn('Firebase not initialized due to missing configuration')
}

export { auth, googleProvider, hasValidConfig }

// Authentication functions
export const signInWithGoogle = async () => {
    if (!hasValidConfig) {
        const error = new Error('Firebase not configured. Please set up Firebase configuration.')
        logger.error('Google Sign In Failed - Firebase not configured', error)
        throw error
    }

    if (!auth || !googleProvider) {
        const error = new Error('Firebase Auth not initialized')
        logger.error('Google Sign In Failed - Auth not initialized', error)
        throw error
    }

    try {
        logger.userAction('Google Sign In Attempt')
        const result = await signInWithPopup(auth, googleProvider)
        const user = result.user
        const idToken = await user.getIdToken()

        logger.userAction('Google Sign In Success', {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName
        })

        return {
            user,
            idToken,
            credential: result.credential
        }
    } catch (error: any) {
        logger.error('Google Sign In Failed', error)

        // Handle specific Firebase Auth errors
        if (error.code === 'auth/popup-closed-by-user') {
            throw new Error('Sign-in was cancelled')
        } else if (error.code === 'auth/popup-blocked') {
            throw new Error('Pop-up was blocked by browser. Please allow pop-ups and try again.')
        } else if (error.code === 'auth/network-request-failed') {
            throw new Error('Network error. Please check your connection and try again.')
        } else {
            throw new Error('Failed to sign in with Google. Please try again.')
        }
    }
}

export const signOut = async () => {
    if (!hasValidConfig || !auth) {
        logger.warn('Sign Out attempted but Firebase not configured')
        return
    }

    try {
        logger.userAction('Sign Out Attempt')
        await firebaseSignOut(auth)
        logger.userAction('Sign Out Success')
    } catch (error) {
        logger.error('Sign Out Failed', error)
        throw new Error('Failed to sign out. Please try again.')
    }
}

// Phone number authentication (existing functionality)
export const sendPhoneOTP = async (phoneNumber: string, recaptchaVerifier: any) => {
    try {
        logger.userAction('Phone OTP Send Attempt', { phoneNumber })
        const { signInWithPhoneNumber } = await import('firebase/auth')
        const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier)
        logger.userAction('Phone OTP Send Success', { phoneNumber })
        return confirmationResult
    } catch (error) {
        logger.error('Phone OTP Send Failed', error)
        throw error
    }
}

export const verifyPhoneOTP = async (confirmationResult: any, otp: string) => {
    try {
        logger.userAction('Phone OTP Verify Attempt')
        const result = await confirmationResult.confirm(otp)
        const idToken = await result.user.getIdToken()
        logger.userAction('Phone OTP Verify Success', { uid: result.user.uid })
        return { user: result.user, idToken }
    } catch (error) {
        logger.error('Phone OTP Verify Failed', error)
        throw error
    }
}

export default app