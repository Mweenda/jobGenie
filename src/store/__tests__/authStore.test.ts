import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuthStore } from '../authStore'
import * as AuthServiceModule from '../../services/authService'

// Mock AuthService
vi.mock('../../services/authService', () => ({
  AuthService: {
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    getCurrentUser: vi.fn(),
    getUserProfile: vi.fn(),
    updateUserProfile: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
}))

const mockAuthService = AuthServiceModule.AuthService as any

describe('AuthStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset store state
    useAuthStore.setState({
      user: null,
      firebaseUser: null,
      isLoading: false,
      isAuthenticated: false,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial State', () => {
    it('has correct initial state', () => {
      const { result } = renderHook(() => useAuthStore())

      expect(result.current.user).toBeNull()
      expect(result.current.firebaseUser).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('signIn', () => {
    it('successfully signs in a user', async () => {
      const mockFirebaseUser = { uid: '1', email: 'test@example.com' }
      const mockUserProfile = { id: '1', email: 'test@example.com', firstName: 'Test', lastName: 'User' }

      mockAuthService.signIn.mockResolvedValue({ user: mockFirebaseUser })
      mockAuthService.getUserProfile.mockResolvedValue(mockUserProfile)

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.signIn('test@example.com', 'password')
      })

      expect(mockAuthService.signIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password'
      })
      expect(result.current.user).toEqual(mockUserProfile)
      expect(result.current.firebaseUser).toEqual(mockFirebaseUser)
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.isLoading).toBe(false)
    })

    it('handles sign in error', async () => {
      const error = new Error('Invalid credentials')
      mockAuthService.signIn.mockRejectedValue(error)

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        try {
          await result.current.signIn('test@example.com', 'wrongpassword')
        } catch (e) {
          expect(e).toBe(error)
        }
      })

      expect(result.current.user).toBeNull()
      expect(result.current.firebaseUser).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('signUp', () => {
    it('successfully signs up a user', async () => {
      const mockFirebaseUser = { uid: '1', email: 'test@example.com' }
      const mockUserProfile = { id: '1', email: 'test@example.com', firstName: 'Test', lastName: 'User' }
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      }

      mockAuthService.signUp.mockResolvedValue({ user: mockFirebaseUser })
      mockAuthService.getUserProfile.mockResolvedValue(mockUserProfile)

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.signUp(userData)
      })

      expect(mockAuthService.signUp).toHaveBeenCalledWith(userData)
      expect(result.current.user).toEqual(mockUserProfile)
      expect(result.current.firebaseUser).toEqual(mockFirebaseUser)
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.isLoading).toBe(false)
    })

    it('handles sign up error', async () => {
      const error = new Error('Email already exists')
      mockAuthService.signUp.mockRejectedValue(error)

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        try {
          await result.current.signUp({
            email: 'test@example.com',
            password: 'password123',
            firstName: 'Test',
            lastName: 'User'
          })
        } catch (e) {
          expect(e).toBe(error)
        }
      })

      expect(result.current.user).toBeNull()
      expect(result.current.firebaseUser).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('signOut', () => {
    it('successfully signs out a user', async () => {
      // Set initial authenticated state
      const { result } = renderHook(() => useAuthStore())
      
      act(() => {
        result.current.setUser({ id: '1', email: 'test@example.com' })
        result.current.setFirebaseUser({ uid: '1', email: 'test@example.com' } as any)
      })

      mockAuthService.signOut.mockResolvedValue(undefined)

      await act(async () => {
        await result.current.signOut()
      })

      expect(mockAuthService.signOut).toHaveBeenCalled()
      expect(result.current.user).toBeNull()
      expect(result.current.firebaseUser).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.isLoading).toBe(false)
    })

    it('handles sign out error', async () => {
      const error = new Error('Sign out failed')
      mockAuthService.signOut.mockRejectedValue(error)

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        try {
          await result.current.signOut()
        } catch (e) {
          expect(e).toBe(error)
        }
      })

      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('updateProfile', () => {
    it('successfully updates user profile', async () => {
      const initialUser = { id: '1', email: 'test@example.com', firstName: 'Test', lastName: 'User' }
      const updates = { firstName: 'Updated', lastName: 'Name' }

      const { result } = renderHook(() => useAuthStore())
      
      act(() => {
        result.current.setUser(initialUser)
      })

      await act(async () => {
        await result.current.updateProfile(updates)
      })

      expect(mockAuthService.updateUserProfile).toHaveBeenCalledWith('1', updates)
      expect(result.current.user).toEqual({ ...initialUser, ...updates })
      expect(result.current.isLoading).toBe(false)
    })

    it('throws error when no user is logged in', async () => {
      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        try {
          await result.current.updateProfile({ firstName: 'Test' })
        } catch (e) {
          expect((e as Error).message).toBe('No user logged in')
        }
      })
    })
  })

  describe('initialize', () => {
    it('initializes with existing user', async () => {
      const mockFirebaseUser = { uid: '1', email: 'test@example.com' }
      const mockUserProfile = { id: '1', email: 'test@example.com', firstName: 'Test', lastName: 'User' }

      mockAuthService.getCurrentUser.mockResolvedValue(mockFirebaseUser)
      mockAuthService.getUserProfile.mockResolvedValue(mockUserProfile)

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.initialize()
      })

      expect(result.current.user).toEqual(mockUserProfile)
      expect(result.current.firebaseUser).toEqual(mockFirebaseUser)
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.isLoading).toBe(false)
    })

    it('initializes with no user', async () => {
      mockAuthService.getCurrentUser.mockResolvedValue(null)

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.initialize()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.firebaseUser).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.isLoading).toBe(false)
    })

    it('handles initialization error', async () => {
      const error = new Error('Initialization failed')
      mockAuthService.getCurrentUser.mockRejectedValue(error)

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.initialize()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.firebaseUser).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.isLoading).toBe(false)
    })
  })
})