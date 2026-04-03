"use client"

import type { ComponentProps } from "react"
import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

// Функция для автоматической вставки параметров оптимизации Cloudinary
const getOptimizedCloudinaryUrl = (url: string) => {
  if (typeof url === 'string' && url.includes('res.cloudinary.com')) {
    // Вставляем авто-формат и авто-качество после /upload/
    return url.replace('/upload/', '/upload/f_auto,q_auto/');
  }
  return url;
};

interface BlurImageProps extends ComponentProps<typeof Image> {}

export function BlurImage({ className, alt, src, priority, ...props }: BlurImageProps) {
  const [isLoading, setLoading] = React.useState(true)

  // Оптимизируем ссылку, если это Cloudinary
  const optimizedSrc = typeof src === 'string' ? getOptimizedCloudinaryUrl(src) : src;

  return (
    <Image
      alt={alt}
      src={optimizedSrc}
      priority={priority}
      className={cn(
        className,
        // Если картинка приоритетная (LCP), отключаем тяжелые анимации для скорости
        !priority && "duration-700 ease-in-out",
        !priority && (isLoading ? "scale-105 blur-lg" : "scale-100 blur-0")
      )}
      onLoad={() => setLoading(false)}
      {...props}
    />
  )
}
