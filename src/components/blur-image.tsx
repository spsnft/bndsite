"use client"

import type { ComponentProps } from "react"
import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface BlurImageProps extends ComponentProps<typeof Image> {}

export function BlurImage({ className, alt, src, ...props }: BlurImageProps) {
  const [isLoading, setLoading] = React.useState(true)

  // Если src пустой или заглушка, можно сразу убирать лоадер
  React.useEffect(() => {
    if (!src) setLoading(false)
  }, [src])

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image
        {...props}
        src={src}
        alt={alt}
        // decoding="async" позволяет браузеру обрабатывать изображение в фоне
        decoding="async"
        // unoptimized={true} — попробуй включить, если лаги на мобилках останутся
        className={cn(
          "duration-500 ease-in-out transition-all",
          isLoading ? "scale-110 blur-2xl opacity-0" : "scale-100 blur-0 opacity-100",
          className
        )}
        onLoad={() => setLoading(false)}
      />
      
      {/* Опционально: можно добавить очень слабый фон, чтобы не было совсем белого пятна */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/5 animate-pulse" />
      )}
    </div>
  )
}
