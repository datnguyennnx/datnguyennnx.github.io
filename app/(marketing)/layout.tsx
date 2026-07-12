import Header from '@/app/components/header'
import Footer from '@/app/components/footer'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col px-4 sm:px-6 md:px-8 lg:px-12">
      <div className="mx-auto flex w-full h-full max-w-7xl flex-col py-5 sm:py-6 gap-4 sm:gap-6 md:gap-8 md:bg-card md:ring-1 md:ring-border md:p-8 lg:p-10">
        <Header />
        <main className="flex flex-1 flex-col">{children}</main>
        <Footer />
      </div>
    </div>
  )
}
