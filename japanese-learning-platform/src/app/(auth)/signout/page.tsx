'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'

export default function SignOutPage() {
  const router = useRouter()

  useEffect(() => {
    signOut({ callbackUrl: '/' })
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Signing you out...
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please wait while we securely sign you out.
          </p>
        </div>
      </div>
    </div>
  )
}