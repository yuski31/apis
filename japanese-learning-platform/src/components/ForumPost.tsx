'use client'

import React, { useState } from 'react'
import { ForumPost } from '@/lib/database/types'

interface ForumPostProps {
  post: ForumPost
  onLike?: (postId: number) => void
  onReply?: (postId: number) => void
  showReplyButton?: boolean
}

export const ForumPost: React.FC<ForumPostProps> = ({
  post,
  onLike,
  onReply,
  showReplyButton = true
}) => {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes_count || 0)

  const handleLike = () => {
    if (onLike) {
      onLike(post.id)
      setLiked(true)
      setLikeCount(prev => prev + 1)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-4">
      <div className="flex items-start">
        {post.user?.avatar_url ? (
          <img
            src={post.user.avatar_url}
            alt={post.user.full_name || post.user.username}
            className="w-10 h-10 rounded-full mr-3"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
            <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                {post.user?.full_name || post.user?.username}
              </h4>
              <p className="text-xs text-gray-500">
                {new Date(post.created_at).toLocaleString()}
              </p>
            </div>
            {post.is_pinned && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Pinned
              </span>
            )}
          </div>

          <div className="mt-3 text-gray-700">
            {post.title && <h3 className="text-lg font-semibold mb-2">{post.title}</h3>}
            <p className="whitespace-pre-line">{post.content}</p>
          </div>

          <div className="mt-4 flex items-center">
            <button
              onClick={handleLike}
              disabled={liked}
              className={`flex items-center text-sm ${
                liked ? 'text-red-500' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg
                className={`h-5 w-5 ${liked ? 'fill-current' : ''}`}
                fill={liked ? 'currentColor' : 'none'}
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span className="ml-1">{likeCount}</span>
            </button>

            {showReplyButton && onReply && (
              <button
                onClick={() => onReply(post.id)}
                className="ml-4 flex items-center text-sm text-gray-500 hover:text-gray-700"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                  />
                </svg>
                <span className="ml-1">Reply</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}