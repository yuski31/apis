import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { StudyGroup, GroupMembership } from '@/lib/database/types'
import {
  getStudyGroups,
  getStudyGroupById,
  getStudyGroupsByUser,
  createStudyGroup,
  updateStudyGroup,
  deleteStudyGroup,
  getUserGroupMemberships,
  getGroupMembers,
  joinStudyGroup,
  leaveStudyGroup
} from '@/lib/database/functions/social'

export const useStudyGroups = (userId: string | undefined) => {
  const [groups, setGroups] = useState<StudyGroup[]>([])
  const [userGroups, setUserGroups] = useState<StudyGroup[]>([])
  const [memberships, setMemberships] = useState<GroupMembership[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true)
      try {
        const allGroups = await getStudyGroups()
        if (allGroups) {
          setGroups(allGroups)
        }

        if (userId) {
          const userGroups = await getStudyGroupsByUser(userId)
          if (userGroups) {
            setUserGroups(userGroups)
          }

          const userMemberships = await getUserGroupMemberships(userId)
          if (userMemberships) {
            setMemberships(userMemberships)
          }
        }
      } catch (err) {
        setError('Failed to fetch study groups')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchGroups()
  }, [userId])

  const createNewGroup = async (
    groupData: Omit<StudyGroup, 'id' | 'member_count' | 'created_by' | 'created_at' | 'updated_at'>
  ) => {
    if (!userId) return null

    try {
      const newGroup = await createStudyGroup(groupData, userId)
      if (newGroup) {
        setGroups(prev => [newGroup, ...prev])
        setUserGroups(prev => [newGroup, ...prev])
        return newGroup
      }
      return null
    } catch (err) {
      setError('Failed to create study group')
      console.error(err)
      return null
    }
  }

  const joinGroup = async (groupId: number) => {
    if (!userId) return false

    try {
      const membership = await joinStudyGroup(userId, groupId)
      if (membership) {
        setMemberships(prev => [...prev, membership])

        // Update user groups
        const group = groups.find(g => g.id === groupId)
        if (group) {
          setUserGroups(prev => {
            if (!prev.some(g => g.id === groupId)) {
              return [group, ...prev]
            }
            return prev
          })
        }

        // Update group member count
        setGroups(prev =>
          prev.map(g =>
            g.id === groupId
              ? { ...g, member_count: g.member_count + 1 }
              : g
          )
        )

        return true
      }
      return false
    } catch (err) {
      setError('Failed to join study group')
      console.error(err)
      return false
    }
  }

  const leaveGroup = async (groupId: number) => {
    if (!userId) return false

    try {
      const success = await leaveStudyGroup(userId, groupId)
      if (success) {
        setMemberships(prev => prev.filter(m => m.group_id !== groupId))
        setUserGroups(prev => prev.filter(g => g.id !== groupId))

        // Update group member count
        setGroups(prev =>
          prev.map(g =>
            g.id === groupId
              ? { ...g, member_count: Math.max(0, g.member_count - 1) }
              : g
          )
        )

        return true
      }
      return false
    } catch (err) {
      setError('Failed to leave study group')
      console.error(err)
      return false
    }
  }

  const isMemberOfGroup = (groupId: number): boolean => {
    return memberships.some(m => m.group_id === groupId)
  }

  const getUserRoleInGroup = (groupId: number): string | null => {
    const membership = memberships.find(m => m.group_id === groupId)
    return membership ? membership.role : null
  }

  return {
    groups,
    userGroups,
    memberships,
    loading,
    error,
    createNewGroup,
    joinGroup,
    leaveGroup,
    isMemberOfGroup,
    getUserRoleInGroup
  }
}