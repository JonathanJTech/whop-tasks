import LoginForm from '@/components/LoginForm'

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-whop-charcoal flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center gap-2 mb-2">
            {/* Whop brandmark — simple "W" monogram */}
            <div className="w-9 h-9 rounded-lg bg-whop-orange flex items-center justify-center">
              <span className="text-white font-semibold text-lg leading-none select-none">W</span>
            </div>
            <span className="text-whop-off-white font-semibold text-2xl tracking-tight">
              Whop
            </span>
          </div>
          <p className="text-whop-dust text-sm mt-1">Sign in to continue</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-8">
          <LoginForm />
        </div>
      </div>
    </main>
  )
}
