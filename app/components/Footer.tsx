export function Footer() {
  return (
    <footer className="border-t border-[#0a1628]/10 bg-[#0a1628] text-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="font-serif text-lg font-semibold">Weekly Finance Articles</p>
        <p className="mt-2 text-sm text-white/80">
          © {new Date().getFullYear()} Weekly Finance Articles. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
