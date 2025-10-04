import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { ForumPost } from '@/lib/database/types'
import {
  getForumPostsByGroup,
  getForumPostById,
  createForumPost,
  updateForumPost,
  deleteForumPost,
  likeForumPost
} from '@/lib/database/functions/social'

export const useForum = (groupId: number | null) => {
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!groupId) return

    const fetchPosts = async () => {
      setLoading(true)
      try {
        const forumPosts = await getForumPostsByGroup(groupId)
        if (forumPosts) {
          setPosts(forumPosts)
        }
      } catch (err) {
        setError('Failed to fetch forum posts')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()

    // Set up real-time subscription for new posts
    const channel = supabase
      .channel('forum-posts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'forum_posts',
          filter: `group_id=eq.${groupId}`
        },
        (payload) => {
          const newPost = payload.new as ForumPost
          setPosts(prev => [newPost, ...prev])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'forum_posts',
          filter: `group_id=eq.${groupId}`
        },
        (payload) => {
          const updatedPost = payload.new as ForumPost
          setPosts(prev =>
            prev.map(post => post.id === updatedPost.id ? updatedPost : post)
          )
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'forum_posts',
          filter: `group_id=eq.${groupId}`
        },
        (payload) => {
          const deletedPost = payload.old as ForumPost
          setPosts(prev => prev.filter(post => post.id !== deletedPost.id))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [groupId])

  const createPost = async (
    postData: Omit<ForumPost, 'id' | 'likes_count' | 'created_at' | 'updated_at'>
  ) => {
    try {
      const newPost = await createForumPost(postData)
      if (newPost) {
        setPosts(prev => [newPost, ...prev])
        return newPost
      }
      return null
    } catch (err) {
      setError('Failed to create post')
      console.error(err)
      return null
    }
  }

  const updatePost = async (
    id: number,
    updates: Partial<ForumPost>
  ) => {
    try {
      const updatedPost = await updateForumPost(id, updates)
      if (updatedPost) {
        setPosts(prev =>
          prev.map(post => post.id === id ? updatedPost : post)
        )
        return updatedPost
      }
      return null
    } catch (err) {
      setError('Failed to update post')
      console.error(err)
      return null
    }
  }

  const deletePost = async (id: number) => {
    try {
      const success = await deleteForumPost(id)
      if (success) {
        setPosts(prev => prev.filter(post => post.id !== id))
        return true
      }
      return false
    } catch (err) {
      setError('Failed to delete post')
      console.error(err)
      return false
    }
  }

  const likePost = async (id: number) => {
    try {
      const success = await likeForumPost(id)
      if (success) {
        setPosts(prev =>
          prev.map(post =>
            post.id === id
              ? { ...post, likes_count: post.likes_count + 1 }
              : post
          )
        )
        return true
      }
      return false
    } catch (err) {
      setError('Failed to like post')
      console.error(err)
      return false
    }
  }

  const getReplies = async (postId: number) => {
    if (!groupId) return null

    try {
      const replies = await getForumPostsByGroup(groupId, postId)
      return replies
    } catch (err) {
      console.error('Error fetching replies:', err)
      return null
    }
  }

  return {
    posts,
    loading,
    error,
    createPost,
    updatePost,
    deletePost,
    likePost,
    getReplies
  }
}