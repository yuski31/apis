import { supabase } from '../../supabase/client'
import { StudyGroup, GroupMembership, ForumPost } from '../types'

// --- Study Groups ---

// Get all study groups
export const getStudyGroups = async (): Promise<StudyGroup[] | null> => {
  try {
    const { data, error } = await supabase
      .from('study_groups')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching study groups:', error)
      return null
    }

    return data as StudyGroup[]
  } catch (error) {
    console.error('Error fetching study groups:', error)
    return null
  }
}

// Get study group by ID
export const getStudyGroupById = async (id: number): Promise<StudyGroup | null> => {
  try {
    const { data, error } = await supabase
      .from('study_groups')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching study group:', error)
      return null
    }

    return data as StudyGroup
  } catch (error) {
    console.error('Error fetching study group:', error)
    return null
  }
}

// Get study groups by user membership
export const getStudyGroupsByUser = async (userId: string): Promise<StudyGroup[] | null> => {
  try {
    const { data, error } = await supabase
      .from('study_groups')
      .select('study_groups(*)')
      .eq('group_memberships.user_id', userId)
      .order('study_groups.created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user study groups:', error)
      return null
    }

    // Extract study groups from the join result
    const groups = data.map((item: any) => item.study_groups) as StudyGroup[]
    return groups
  } catch (error) {
    console.error('Error fetching user study groups:', error)
    return null
  }
}

// Create a new study group
export const createStudyGroup = async (
  group: Omit<StudyGroup, 'id' | 'member_count' | 'created_at' | 'updated_at'>,
  creatorId: string
): Promise<StudyGroup | null> => {
  try {
    // Create the study group
    const { data: groupData, error: groupError } = await supabase
      .from('study_groups')
      .insert([
        {
          ...group,
          created_by: creatorId,
          member_count: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (groupError) {
      console.error('Error creating study group:', groupError)
      return null
    }

    const studyGroup = groupData as StudyGroup

    // Add creator as admin member
    const { error: membershipError } = await supabase
      .from('group_memberships')
      .insert([
        {
          user_id: creatorId,
          group_id: studyGroup.id,
          role: 'admin',
          joined_at: new Date().toISOString()
        }
      ])

    if (membershipError) {
      console.error('Error adding creator to group:', membershipError)
      // Note: In a production app, you might want to delete the group if this fails
    }

    return studyGroup
  } catch (error) {
    console.error('Error creating study group:', error)
    return null
  }
}

// Update a study group
export const updateStudyGroup = async (
  id: number,
  updates: Partial<StudyGroup>
): Promise<StudyGroup | null> => {
  try {
    const { data, error } = await supabase
      .from('study_groups')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating study group:', error)
      return null
    }

    return data as StudyGroup
  } catch (error) {
    console.error('Error updating study group:', error)
    return null
  }
}

// Delete a study group
export const deleteStudyGroup = async (id: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('study_groups')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting study group:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting study group:', error)
    return false
  }
}

// --- Group Memberships ---

// Get group memberships for a user
export const getUserGroupMemberships = async (userId: string): Promise<GroupMembership[] | null> => {
  try {
    const { data, error } = await supabase
      .from('group_memberships')
      .select('*')
      .eq('user_id', userId)
      .order('joined_at', { ascending: false })

    if (error) {
      console.error('Error fetching user group memberships:', error)
      return null
    }

    return data as GroupMembership[]
  } catch (error) {
    console.error('Error fetching user group memberships:', error)
    return null
  }
}

// Get members of a study group
export const getGroupMembers = async (groupId: number): Promise<GroupMembership[] | null> => {
  try {
    const { data, error } = await supabase
      .from('group_memberships')
      .select(`
        *,
        user:users(full_name, username, avatar_url)
      `)
      .eq('group_id', groupId)
      .order('joined_at', { ascending: true })

    if (error) {
      console.error('Error fetching group members:', error)
      return null
    }

    return data as GroupMembership[]
  } catch (error) {
    console.error('Error fetching group members:', error)
    return null
  }
}

// Join a study group
export const joinStudyGroup = async (
  userId: string,
  groupId: number
): Promise<GroupMembership | null> => {
  try {
    // Check if user is already a member
    const { data: existingMembership } = await supabase
      .from('group_memberships')
      .select('*')
      .eq('user_id', userId)
      .eq('group_id', groupId)
      .single()

    if (existingMembership) {
      return existingMembership as GroupMembership
    }

    // Add user to group as member
    const { data, error } = await supabase
      .from('group_memberships')
      .insert([
        {
          user_id: userId,
          group_id: groupId,
          role: 'member',
          joined_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error joining study group:', error)
      return null
    }

    // Increment group member count
    await supabase
      .from('study_groups')
      .update({
        member_count: supabase.rpc('increment_member_count', { group_id: groupId }),
        updated_at: new Date().toISOString()
      })
      .eq('id', groupId)

    return data as GroupMembership
  } catch (error) {
    console.error('Error joining study group:', error)
    return null
  }
}

// Leave a study group
export const leaveStudyGroup = async (userId: string, groupId: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('group_memberships')
      .delete()
      .eq('user_id', userId)
      .eq('group_id', groupId)

    if (error) {
      console.error('Error leaving study group:', error)
      return false
    }

    // Decrement group member count
    await supabase
      .from('study_groups')
      .update({
        member_count: supabase.rpc('decrement_member_count', { group_id: groupId }),
        updated_at: new Date().toISOString()
      })
      .eq('id', groupId)

    return true
  } catch (error) {
    console.error('Error leaving study group:', error)
    return false
  }
}

// --- Forum Posts ---

// Get forum posts for a group
export const getForumPostsByGroup = async (
  groupId: number,
  parentId: number | null = null
): Promise<ForumPost[] | null> => {
  try {
    let query = supabase
      .from('forum_posts')
      .select(`
        *,
        user:users(full_name, username, avatar_url)
      `)
      .eq('group_id', groupId)

    if (parentId === null) {
      // Get top-level posts only
      query = query.is('parent_post_id', null)
    } else if (parentId > 0) {
      // Get replies to a specific post
      query = query.eq('parent_post_id', parentId)
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error('Error fetching forum posts:', error)
      return null
    }

    return data as ForumPost[]
  } catch (error) {
    console.error('Error fetching forum posts:', error)
    return null
  }
}

// Get a specific forum post
export const getForumPostById = async (id: number): Promise<ForumPost | null> => {
  try {
    const { data, error } = await supabase
      .from('forum_posts')
      .select(`
        *,
        user:users(full_name, username, avatar_url)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching forum post:', error)
      return null
    }

    return data as ForumPost
  } catch (error) {
    console.error('Error fetching forum post:', error)
    return null
  }
}

// Create a new forum post
export const createForumPost = async (
  post: Omit<ForumPost, 'id' | 'likes_count' | 'created_at' | 'updated_at'>
): Promise<ForumPost | null> => {
  try {
    const { data, error } = await supabase
      .from('forum_posts')
      .insert([
        {
          ...post,
          likes_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select(`
        *,
        user:users(full_name, username, avatar_url)
      `)
      .single()

    if (error) {
      console.error('Error creating forum post:', error)
      return null
    }

    return data as ForumPost
  } catch (error) {
    console.error('Error creating forum post:', error)
    return null
  }
}

// Update a forum post
export const updateForumPost = async (
  id: number,
  updates: Partial<ForumPost>
): Promise<ForumPost | null> => {
  try {
    const { data, error } = await supabase
      .from('forum_posts')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        user:users(full_name, username, avatar_url)
      `)
      .single()

    if (error) {
      console.error('Error updating forum post:', error)
      return null
    }

    return data as ForumPost
  } catch (error) {
    console.error('Error updating forum post:', error)
    return null
  }
}

// Delete a forum post
export const deleteForumPost = async (id: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('forum_posts')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting forum post:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting forum post:', error)
    return false
  }
}

// Like a forum post
export const likeForumPost = async (postId: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('forum_posts')
      .update({
        likes_count: supabase.rpc('increment_likes', { post_id: postId }),
        updated_at: new Date().toISOString()
      })
      .eq('id', postId)

    if (error) {
      console.error('Error liking forum post:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error liking forum post:', error)
    return false
  }
}