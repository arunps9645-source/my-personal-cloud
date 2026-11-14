
import { supabase } from './supabase'

const validEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

const mapUser = (user) => ({
  id: user.id,
  email: user.email,
  name: user.user_metadata?.full_name || user.email?.split('@')[0],
})

export const authService = {
  isDemo: false,

  async signIn({ email, password }) {
    if (!validEmail(email)) return { error: 'Enter a valid email address' }
    if (!password) return { error: 'Enter your password' }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) return { error: error.message }
    return { user: mapUser(data.user) }
  },

  async signUp({ name, email, password }) {
    if (!name?.trim()) return { error: 'Enter your name' }
    if (!validEmail(email)) return { error: 'Enter a valid email address' }
    if (!password || password.length < 8) {
      return { error: 'Password must be at least 8 characters' }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name.trim() },
      },
    })

    if (error) return { error: error.message }

    if (!data.session) {
      return {
        user: null,
        message: 'Please verify your email before signing in.',
      }
    }

    return { user: mapUser(data.user) }
  },

  async resetPassword({ email }) {
    if (!validEmail(email)) return { error: 'Enter a valid email address' }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    })

    return error
      ? { error: error.message }
      : { message: 'Password reset email sent. Check your inbox.' }
  },

  async changePassword({ next, confirm }) {
    if (!next || next.length < 8) {
      return { error: 'Password must be at least 8 characters' }
    }

    if (next !== confirm) {
      return { error: 'Passwords do not match' }
    }

    const { error } = await supabase.auth.updateUser({
      password: next,
    })

    return error ? { error: error.message } : { success: true }
  },
}
