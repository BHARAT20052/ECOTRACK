import { useState, useEffect } from 'react'
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged,
  updateProfile,
  type User
} from 'firebase/auth'
import { auth } from '@/services/firebase'
import { createUserProfile } from '@/services/firestore'

/** Map Firebase error codes to user-friendly messages */
function getAuthErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Invalid email or password. Please try again.'
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.'
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 6 characters.'
      case 'auth/invalid-email':
        return 'Please enter a valid email address.'
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.'
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection.'
      case 'auth/popup-closed-by-user':
        return 'Sign-in popup was closed. Please try again.'
      case 'auth/popup-blocked':
        return 'Sign-in popup was blocked. Please allow popups for this site.'
      case 'auth/account-exists-with-different-credential':
        return 'An account already exists with a different sign-in method.'
      case 'auth/operation-not-allowed':
        return 'This sign-in method is not enabled. Please contact support.'
      case 'auth/admin-restricted-operation':
        return 'This sign-in method is not enabled. Please enable Email/Password auth in Firebase Console.'
      case 'auth/configuration-not-found':
        return 'Firebase Authentication is not configured or enabled for this project. Please open your Firebase Console, go to Authentication, and enable the Email/Password and Google providers.'
      default:
        return `Authentication failed (${code}).`
    }
  }
  if (error instanceof Error) return error.message
  return 'Authentication failed. Please try again.'
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const loginWithEmail = async (email: string, password: string) => {
    try {
      return await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      throw new Error(getAuthErrorMessage(error))
    }
  }

  const registerWithEmail = async (email: string, password: string, displayName: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      // Update the Firebase Auth profile with displayName
      await updateProfile(cred.user, { displayName })
      // Create Firestore profile (non-blocking — don't let this prevent login)
      try {
        await createUserProfile(cred.user.uid, {
          uid: cred.user.uid,
          email: cred.user.email ?? '',
          displayName,
          photoURL: '',
        })
      } catch (profileError) {
        console.warn('Failed to create user profile in Firestore:', profileError)
      }
      return cred
    } catch (error) {
      // Re-throw if already a mapped error from the inner catch
      if (error instanceof Error && !('code' in error)) throw error
      throw new Error(getAuthErrorMessage(error))
    }
  }

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const cred = await signInWithPopup(auth, provider)
      // Create/update Firestore profile (non-blocking)
      try {
        await createUserProfile(cred.user.uid, {
          uid: cred.user.uid,
          email: cred.user.email ?? '',
          displayName: cred.user.displayName ?? '',
          photoURL: cred.user.photoURL ?? '',
        })
      } catch (profileError) {
        console.warn('Failed to create/update user profile in Firestore:', profileError)
      }
      return cred
    } catch (error) {
      throw new Error(getAuthErrorMessage(error))
    }
  }

  const logout = () => signOut(auth)

  return { user, loading, loginWithEmail, registerWithEmail, loginWithGoogle, logout }
}
