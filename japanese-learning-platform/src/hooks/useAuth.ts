import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export const useAuth = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true)
    } else {
      setIsLoading(false)

      // Redirect unauthenticated users to sign in page
      if (status === 'unauthenticated') {
        router.push('/auth/signin')
      }
    }
  }, [status, router])

  return {
    session,
    user: session?.user,
    isAuthenticated: status === 'authenticated',
    isLoading: isLoading || status === 'loading'
  }
}