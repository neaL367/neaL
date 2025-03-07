"use client"

import { useState } from "react"
import { PhotoCard } from "./photo-card"
import { PhotoModal } from "./photo-modal"
import type { InstagramPost } from "@/types"

interface PhotoGridProps {
  initialPosts: InstagramPost[]
}

export function PhotoGrid({ initialPosts }: PhotoGridProps) {
  const [posts] = useState<InstagramPost[]>(initialPosts)
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null)

  const openModal = (index: number) => {
    setSelectedPhoto(index)
  }

  const closeModal = () => {
    setSelectedPhoto(null)
  }

  const goToNextPhoto = () => {
    setSelectedPhoto((prev) => {
      if (prev === null) return null
      return prev === posts.length - 1 ? 0 : prev + 1
    })
  }

  const goToPreviousPhoto = () => {
    setSelectedPhoto((prev) => {
      if (prev === null) return null
      return prev === 0 ? posts.length - 1 : prev - 1
    })
  }

  return (
    <div className="">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {posts.map((post, index) => (
          <PhotoCard key={post.id} post={post} onClick={() => openModal(index)} />
        ))}
      </div>

      {selectedPhoto !== null && (
        <PhotoModal
          post={posts[selectedPhoto]}
          onClose={closeModal}
          onNext={goToNextPhoto}
          onPrevious={goToPreviousPhoto}
        />
      )}
    </div>
  )
}

