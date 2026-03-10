'use client'

import { useEffect, useState } from 'react'

export interface TocHeading {
  id: string
  text: string
  level: string
}

export function TableOfContents({ headings }: { headings: TocHeading[] }) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '0px 0px -70% 0px', threshold: 0 },
    )

    headings.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <nav aria-label="Table of contents" className="sticky top-24">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#0a1628]/40 dark:text-white/35 mb-4">
        Contents
      </p>
      <ul className="space-y-1 border-l border-[#0a1628]/10 dark:border-white/10">
        {headings.map(({ id, text, level }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              onClick={(e) => {
                e.preventDefault()
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
              }}
              className={[
                'block py-1 text-sm leading-snug transition-all duration-200',
                level === 'h3' ? 'pl-6' : 'pl-4',
                activeId === id
                  ? 'text-[#c9a84c] font-semibold border-l-2 border-[#c9a84c] -ml-px'
                  : 'text-[#0a1628]/55 dark:text-white/50 hover:text-[#0a1628] dark:hover:text-white/80',
              ].join(' ')}
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
