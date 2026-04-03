"use client"

import type { ComponentProps } from "react"
import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface BlurImageProps extends ComponentProps<typeof Image> {}

export function BlurImage({ className, alt, src, priority, ...props }: BlurImageProps) {
  const [isLoading, setLoading] = React.useState(!priority)

  // Если это priority image, мы предполагаем, что она должна появиться максимально быстро
  React.useEffect(() => {
    if (priority) setLoading(false)
  }, [priority])

  return (
    <div className={cn("relative w-full h-full overflow-hidden flex items-center justify-center", className)}>
      <Image
        {...props}
        src={src}
        alt={alt || ""}
        priority={priority}
        // translateZ(0) включает аппаратное ускорение, убирая "дерганье" при скролле
        style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
        className={cn(
          "duration-700 ease-in-out transition-all",
          isLoading ? "scale-105 blur-2xl opacity-0" : "scale-100 blur-0 opacity-100",
          className
        )}
        onLoad={() => setLoading(false)}
      />
      
      {isLoading && (
        <div className="absolute inset-0 bg-white/5 animate-pulse z-[-1]" />
      )}
    </div>
  )
}
