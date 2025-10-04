'use client'

import React from 'react'
import { LessonItem, Character, Word, GrammarPoint } from '@/lib/database/types'
import { getCharacterById, getWordById, getGrammarPointById } from '@/lib/database/functions'

interface LessonItemDisplayProps {
  item: LessonItem
}

export const LessonItemDisplay: React.FC<LessonItemDisplayProps> = ({ item }) => {
  const [content, setContent] = React.useState<Character | Word | GrammarPoint | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchContent = async () => {
      setLoading(true)
      try {
        let fetchedContent = null
        switch (item.content_type) {
          case 'character':
            fetchedContent = await getCharacterById(item.content_id)
            break
          case 'word':
            fetchedContent = await getWordById(item.content_id)
            break
          case 'grammar':
            fetchedContent = await getGrammarPointById(item.content_id)
            break
        }
        setContent(fetchedContent)
      } catch (error) {
        console.error('Error fetching content:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [item])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="p-4 bg-red-50 rounded-lg">
        <p className="text-red-800">Failed to load content</p>
      </div>
    )
  }

  switch (item.content_type) {
    case 'character':
      const character = content as Character
      return (
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="text-4xl font-japanese text-center mb-2">{character.character}</div>
          <div className="text-center text-gray-600">
            {character.meaning.join(', ')}
          </div>
          {character.readings && (
            <div className="mt-2 text-center text-sm text-gray-500">
              {character.readings.onyomi && (
                <div>音読み: {character.readings.onyomi.join(', ')}</div>
              )}
              {character.readings.kunyomi && (
                <div>訓読み: {character.readings.kunyomi.join(', ')}</div>
              )}
            </div>
          )}
        </div>
      )

    case 'word':
      const word = content as Word
      return (
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="text-2xl font-japanese text-gray-900">{word.word}</div>
          {word.reading && (
            <div className="text-lg text-gray-600 mt-1">{word.reading}</div>
          )}
          <div className="mt-2">
            {word.meanings.map((meaning, index) => (
              <div key={index} className="mb-2">
                <div className="font-medium">{meaning.meaning}</div>
                {meaning.example_sentences && (
                  <div className="ml-2 mt-1">
                    {meaning.example_sentences.map((example, exIndex) => (
                      <div key={exIndex} className="text-sm text-gray-600">
                        <div>{example.japanese}</div>
                        <div className="italic">{example.english}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )

    case 'grammar':
      const grammar = content as GrammarPoint
      return (
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="text-xl font-bold text-gray-900">{grammar.title}</div>
          <div className="text-lg font-japanese text-gray-800 mt-1">{grammar.structure}</div>
          <div className="mt-2 text-gray-700">{grammar.meaning}</div>
          {grammar.usage_notes && (
            <div className="mt-2 text-sm text-gray-600">
              <strong>Usage:</strong> {grammar.usage_notes}
            </div>
          )}
          {grammar.examples && (
            <div className="mt-3">
              <strong className="text-gray-700">Examples:</strong>
              <div className="mt-1 space-y-2">
                {grammar.examples.map((example, index) => (
                  <div key={index} className="text-sm">
                    <div className="font-japanese">{example.japanese}</div>
                    <div className="italic text-gray-600">{example.english}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )

    default:
      return (
        <div className="p-4 bg-gray-50 rounded-lg">
          <p>Unsupported content type</p>
        </div>
      )
  }
}