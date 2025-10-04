'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AuthErrorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = () => {
    switch (error) {
      case 'OAuthAccountNotLinked':
        return 'This email is already associated with another account. Please sign in using the original method.'
      case 'EmailSignin':
        return 'Unable to send email. Please try again later.'
      case 'CredentialsSignin':
        return 'Invalid email or password. Please try again.'
      case 'Callback':
        return 'An error occurred during authentication. Please try again.'
      default:
        return 'An unknown error occurred during authentication.'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {getErrorMessage()}
          </p>
          <div className="mt-6 space-y-4">
            <button
              onClick={() => router.back()}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Go Back
            </button>
            <Link
              href="/auth/signin"
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Try Again
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}