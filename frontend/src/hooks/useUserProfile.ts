import useSWR from 'swr'
import axios from '@/lib/axios'

interface UserProfile {
  id: string
  username: string
  display_name: string
  total_points: number
  current_level: number
  places_discovered: number
  places_visited: number
  current_streak: number
  longest_streak: number
  created_at: string
  updated_at: string
}

export const useUserProfile = () => {
  const {
    data: profile,
    error,
    mutate,
    isLoading
  } = useSWR<UserProfile>(
    '/profile',
    async () => {
      try {
        const response = await axios.get<UserProfile>('/profile')
        return response.data
      } catch (error: unknown) {
        // Don't throw 401 errors - just return null for unauthenticated users
        if (error && typeof error === 'object' && 'response' in error &&
            error.response && typeof error.response === 'object' &&
            'status' in error.response && error.response.status === 401) {
          return null
        }
        throw error
      }
    },
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 0,
      dedupingInterval: 30000, // Cache for 30 seconds
    }
  )

  return {
    profile,
    isLoading,
    error,
    mutate,
  }
}