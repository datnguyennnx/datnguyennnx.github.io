import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-8">
        <p className="select-none text-[8rem] font-bold leading-none tracking-tight text-border sm:text-[11rem]">
          404
        </p>
        <p className="flex text-sm text-muted-foreground">
          Wrong turn. Head back.
        </p>
        <Link
          href="/"
          className="flex text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Home
        </Link>
      </div>
    </div>
  )
}
