import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock Firebase modules at the top level
vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  updateProfile: vi.fn(),
  onAuthStateChanged: vi.fn(),
}))

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  updateDoc: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(),
}))

vi.mock('../../lib/firebase', () => ({
  auth: { currentUser: null },
  db: {},
}))

// Import after mocking
import { AuthService } from '../authService'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth'
import {
  setDoc,
  getDoc,
  updateDoc,
  getDocs,
} from 'firebase/firestore'
import { auth } from '../../lib/firebase'

// Get the mocked functions
const mockCreateUserWithEmailAndPassword = vi.mocked(createUserWithEmailAndPassword)
const mockSignInWithEmailAndPassword = vi.mocked(signInWithEmailAndPassword)
const mockSignOut = vi.mocked(signOut)
const mockSendPasswordResetEmail = vi.mocked(sendPasswordResetEmail)
const mockUpdateProfile = vi.mocked(updateProfile)
const mockOnAuthStateChanged = vi.mocked(onAuthStateChanged)
const mockSetDoc = vi.mocked(setDoc)
const mockGetDoc = vi.mocked(getDoc)
const mockUpdateDoc = vi.mocked(updateDoc)
const mockGetDocs = vi.mocked(getDocs)

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset auth state
    ;(auth as any).currentUser = null
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('signUp', () => {
    it('successfully signs up a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        jobTitle: 'Developer',
        experienceLevel: 'Mid',
      }

      const mockUser = {
        uid: 'user123',
        email: 'test@example.com',
      }

      mockCreateUserWithEmailAndPassword.mockResolvedValue({
        user: mockUser,
      } as any)
      mockUpdateProfile.mockResolvedValue(undefined)
      mockSetDoc.mockResolvedValue(undefined)

      const result = await AuthService.signUp(userData)

      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
        auth,
        userData.email,
        userData.password
      )
      expect(mockUpdateProfile).toHaveBeenCalledWith(mockUser, {
        displayName: `${userData.firstName} ${userData.lastName}`
      })
      expect(mockSetDoc).toHaveBeenCalled()
      expect(result.user).toEqual(mockUser)
    })

    it('throws error when sign up fails', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      }

      const error = new Error('Email already in use')
      mockCreateUserWithEmailAndPassword.mockRejectedValue(error)

      await expect(AuthService.signUp(userData)).rejects.toThrow('Email already in use')
    })
  })

  describe('signIn', () => {
    it('successfully signs in a user', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      }

      const mockUser = {
        uid: 'user123',
        email: 'test@example.com',
      }

      mockSignInWithEmailAndPassword.mockResolvedValue({
        user: mockUser,
      } as any)

      const mockDocSnap = {
        exists: () => true,
        data: () => ({
          id: 'user123',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
        }),
      }
      mockGetDoc.mockResolvedValue(mockDocSnap as any)

      const result = await AuthService.signIn(credentials)

      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
        auth,
        credentials.email,
        credentials.password
      )
      expect(result.user).toEqual(mockUser)
    })

    it('throws error when sign in fails', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      }

      const error = new Error('Invalid credentials')
      mockSignInWithEmailAndPassword.mockRejectedValue(error)

      await expect(AuthService.signIn(credentials)).rejects.toThrow('Invalid credentials')
    })
  })

  describe('signOut', () => {
    it('successfully signs out a user', async () => {
      mockSignOut.mockResolvedValue(undefined)

      await expect(AuthService.signOut()).resolves.not.toThrow()
      expect(mockSignOut).toHaveBeenCalledWith(auth)
    })

    it('throws error when sign out fails', async () => {
      const error = new Error('Sign out failed')
      mockSignOut.mockRejectedValue(error)

      await expect(AuthService.signOut()).rejects.toThrow('Sign out failed')
    })
  })

  describe('getCurrentUser', () => {
    it('returns current user', async () => {
      const mockUser = {
        uid: 'user123',
        email: 'test@example.com',
      }
      ;(auth as any).currentUser = mockUser

      const mockDocSnap = {
        exists: () => true,
        data: () => ({
          id: 'user123',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
        }),
      }
      mockGetDoc.mockResolvedValue(mockDocSnap as any)

      const result = await AuthService.getCurrentUser()
      expect(result).toEqual(mockUser)
    })

    it('returns null when no user', async () => {
      ;(auth as any).currentUser = null

      const result = await AuthService.getCurrentUser()
      expect(result).toBeNull()
    })
  })

  describe('getUserProfile', () => {
    it('returns user profile', async () => {
      const mockProfile = {
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      }

      const mockDocSnap = {
        exists: () => true,
        data: () => mockProfile,
      }
      mockGetDoc.mockResolvedValue(mockDocSnap as any)

      const result = await AuthService.getUserProfile('123')

      expect(result).toEqual(mockProfile)
    })

    it('returns null when profile not found', async () => {
      const mockDocSnap = {
        exists: () => false,
      }
      mockGetDoc.mockResolvedValue(mockDocSnap as any)

      const result = await AuthService.getUserProfile('123')
      expect(result).toBeNull()
    })
  })

  describe('updateUserProfile', () => {
    it('successfully updates user profile', async () => {
      const updates = {
        firstName: 'Updated',
        lastName: 'Name',
      }

      const mockUpdatedProfile = {
        id: '123',
        email: 'test@example.com',
        firstName: 'Updated',
        lastName: 'Name',
      }

      mockUpdateDoc.mockResolvedValue(undefined)
      
      const mockDocSnap = {
        exists: () => true,
        data: () => mockUpdatedProfile,
      }
      mockGetDoc.mockResolvedValue(mockDocSnap as any)

      const result = await AuthService.updateUserProfile('123', updates)

      expect(mockUpdateDoc).toHaveBeenCalled()
      expect(result).toEqual(mockUpdatedProfile)
    })

    it('throws error when update fails', async () => {
      const updates = { firstName: 'Updated' }
      const error = new Error('Update failed')
      mockUpdateDoc.mockRejectedValue(error)

      await expect(AuthService.updateUserProfile('123', updates)).rejects.toThrow('Update failed')
    })
  })

  describe('resetPassword', () => {
    it('successfully sends reset password email', async () => {
      mockSendPasswordResetEmail.mockResolvedValue(undefined)

      await expect(AuthService.resetPassword('test@example.com')).resolves.not.toThrow()
      expect(mockSendPasswordResetEmail).toHaveBeenCalledWith(auth, 'test@example.com')
    })

    it('throws error when reset fails', async () => {
      const error = new Error('Reset failed')
      mockSendPasswordResetEmail.mockRejectedValue(error)

      await expect(AuthService.resetPassword('test@example.com')).rejects.toThrow('Reset failed')
    })
  })

  describe('checkEmailExists', () => {
    it('returns true when email exists', async () => {
      const mockQuerySnapshot = {
        empty: false,
      }
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any)

      const result = await AuthService.checkEmailExists('test@example.com')
      expect(result).toBe(true)
    })

    it('returns false when email does not exist', async () => {
      const mockQuerySnapshot = {
        empty: true,
      }
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any)

      const result = await AuthService.checkEmailExists('test@example.com')
      expect(result).toBe(false)
    })
  })

  describe('onAuthStateChange', () => {
    it('sets up auth state change listener', () => {
      const callback = vi.fn()
      mockOnAuthStateChanged.mockReturnValue(() => {})

      AuthService.onAuthStateChange(callback)

      expect(mockOnAuthStateChanged).toHaveBeenCalledWith(auth, expect.any(Function))
    })
  })
})