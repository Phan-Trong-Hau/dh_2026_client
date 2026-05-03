import { useState, useEffect } from 'react'

export function useImagePreloader(urls: string[]) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!urls || urls.length === 0) {
      setIsLoaded(true)
      setProgress(100)
      return
    }

    let loadedCount = 0
    const totalCount = urls.length

    const updateProgress = () => {
      loadedCount++
      const currentProgress = Math.round((loadedCount / totalCount) * 100)
      setProgress(currentProgress)
      if (loadedCount >= totalCount) {
        // Thêm một chút delay nhỏ để cảm giác mượt mà hơn khi hoàn thành
        setTimeout(() => setIsLoaded(true), 400)
      }
    }

    urls.forEach((url) => {
      const img = new Image()
      img.src = url
      
      const handleLoad = async () => {
        try {
          if ('decode' in img) {
            await img.decode()
          }
          updateProgress()
        } catch (err) {
          console.error(`Failed to decode image: ${url}`, err)
          updateProgress() // Vẫn tiếp tục
        }
      }

      if (img.complete) {
        handleLoad()
      } else {
        img.onload = handleLoad
        img.onerror = updateProgress
      }
    })
  }, [urls])

  return { isLoaded, progress }
}
