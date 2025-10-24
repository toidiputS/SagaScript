import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase, getUserProfile, createUserProfile } from '@/lib/supabase'
import { Database } from '../../shared/supabase-types'
import { useToast } from '@/hooks/use-toast'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: AuthError | null }>
  signInWithGoogle: () => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useSupabaseAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider')
  }
  return context
}

interface SupabaseAuthProviderProps {
  children: React.ReactNode
}

export function SupabaseAuthProvider({ children }: SupabaseAuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        await loadUserProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }

      // Handle specific auth events
      if (event === 'SIGNED_IN') {
        toast({
          title: 'Welcome back!',
          description: 'You have been successfully signed in.',
        })
      } else if (event === 'SIGNED_OUT') {
        toast({
          title: 'Signed out',
          description: 'You have been successfully signed out.',
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [toast])

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await getUserProfile(userId)
      
      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create one
        const user = await supabase.auth.getUser()
        if (user.data.user) {
          await createDefaultProfile(user.data.user)
        }
      } else if (error) {
        console.error('Error loading profile:', error)
        toast({
          title: 'Profile Error',
          description: 'Failed to load your profile. Please try refreshing the page.',
          variant: 'destructive',
        })
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const createDefaultProfile = async (user: User) => {
    try {
      const username = user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`
      const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'New User'
      
      const { data, error } = await createUserProfile({
        id: user.id,
        email: user.email!,
        display_name: displayName,
        username,
        plan: 'apprentice',
        avatar_url: user.user_metadata?.avatar_url || null,
      })

      if (error) {
        console.error('Error creating profile:', error)
        toast({
          title: 'Profile Creation Error',
          description: 'Failed to create your profile. Please contact support.',
          variant: 'destructive',
        })
      } else {
        setProfile(data)
        toast({
          title: 'Welcome to SagaScript!',
          description: 'Your profile has been created successfully.',
        })
      }
    } catch (error) {
      console.error('Error creating default profile:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      setLoading(false)
      toast({
        title: 'Sign In Error',
        description: error.message,
        variant: 'destructive',
      })
    }
    
    return { error }
  }

  const signUp = async (email: string, password: string, displayName: string) => {
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: displayName,
        },
      },
    })
    
    if (error) {
      setLoading(false)
      toast({
        title: 'Sign Up Error',
        description: error.message,
        variant: 'destructive',
      })
    } else if (data.user && !data.session) {
      setLoading(false)
      toast({
        title: 'Check your email',
        description: 'We sent you a confirmation link to complete your registration.',
      })
    }
    
    return { error }
  }

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    
    if (error) {
      toast({
        title: 'Google Sign In Error',
        description: error.message,
        variant: 'destructive',
      })
    }
    
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      toast({
        title: 'Sign Out Error',
        description: error.message,
        variant: 'destructive',
      })
    }
    
    return { error }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      return { error: new Error('No user logged in') }
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        toast({
          title: 'Update Error',
          description: error.message,
          variant: 'destructive',
        })
        return { error }
      }

      setProfile(data)
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      })
      
      return { error: null }
    } catch (error) {
      const err = error as Error
      toast({
        title: 'Update Error',
        description: err.message,
        variant: 'destructive',
      })
      return { error: err }
    }
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}