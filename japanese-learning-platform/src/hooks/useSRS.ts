import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { SRSCard, UserPerformance } from '@/lib/database/types'
import {
  getUserSRSCards,
  getDueSRSCards,
  getSRSCardByContent,
  createSRSCard,
  updateSRSCard,
  calculateSM2,
  updateUserPerformance
} from '@/lib/database/functions/srs'

export const useSRS = (userId: string | undefined) => {
  const [srsCards, setSrsCards] = useState<SRSCard[]>([])
  const [dueCards, setDueCards] = useState<SRSCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return

    const fetchSRSCards = async () => {
      setLoading(true)
      try {
        const cards = await getUserSRSCards(userId)
        if (cards) {
          setSrsCards(cards)
        }

        const due = await getDueSRSCards(userId)
        if (due) {
          setDueCards(due)
        }
      } catch (err) {
        setError('Failed to fetch SRS cards')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchSRSCards()

    // Set up real-time subscription
    const channel = supabase
      .channel('srs-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'srs_cards',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          setSrsCards((prev) => [...prev, payload.new as SRSCard])
          // Check if this is a due card
          if (new Date(payload.new.next_review) <= new Date()) {
            setDueCards((prev) => [...prev, payload.new as SRSCard])
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'srs_cards',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          setSrsCards((prev) =>
            prev.map((card) => (card.id === payload.new.id ? (payload.new as SRSCard) : card))
          )
          // Update due cards if necessary
          setDueCards((prev) =>
            prev.map((card) => (card.id === payload.new.id ? (payload.new as SRSCard) : card))
          )
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'srs_cards',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          setSrsCards((prev) => prev.filter((card) => card.id !== payload.old.id))
          setDueCards((prev) => prev.filter((card) => card.id !== payload.old.id))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const reviewCard = async (
    cardId: number,
    quality: number,
    responseTime: number
  ) => {
    if (!userId) return null

    try {
      // Get the current card
      const card = srsCards.find((c) => c.id === cardId)
      if (!card) return null

      // Calculate new SRS values using SM-2 algorithm
      const sm2Result = calculateSM2(
        quality,
        card.repetitions,
        card.ease_factor,
        card.interval
      )

      // Calculate next review date
      const nextReview = new Date()
      nextReview.setDate(nextReview.getDate() + sm2Result.interval)

      // Update the SRS card
      const updatedCard = await updateSRSCard(cardId, {
        ...sm2Result,
        last_reviewed: new Date().toISOString(),
        next_review: nextReview.toISOString()
      })

      // Update user performance
      await updateUserPerformance(
        userId,
        card.content_type,
        card.content_id,
        quality >= 3, // Consider 3+ as correct
        responseTime
      )

      if (updatedCard) {
        // Update local state
        setSrsCards((prev) =>
          prev.map((c) => (c.id === cardId ? updatedCard : c))
        )
        setDueCards((prev) =>
          prev.filter((c) => c.id !== cardId)
        )
      }

      return updatedCard
    } catch (err) {
      setError('Failed to review card')
      console.error(err)
      return null
    }
  }

  const addToSRS = async (
    contentType: 'character' | 'word' | 'grammar',
    contentId: number
  ) => {
    if (!userId) return null

    try {
      // Check if card already exists
      const existingCard = await getSRSCardByContent(userId, contentType, contentId)
      if (existingCard) return existingCard

      // Create new SRS card
      const newCard = await createSRSCard({
        user_id: userId,
        content_type: contentType,
        content_id: contentId,
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        next_review: new Date().toISOString(),
        last_reviewed: null
      })

      if (newCard) {
        setSrsCards((prev) => [...prev, newCard])
        // If it's due now, add to due cards
        if (new Date(newCard.next_review!) <= new Date()) {
          setDueCards((prev) => [...prev, newCard])
        }
      }

      return newCard
    } catch (err) {
      setError('Failed to add card to SRS')
      console.error(err)
      return null
    }
  }

  return {
    srsCards,
    dueCards,
    loading,
    error,
    reviewCard,
    addToSRS
  }
}