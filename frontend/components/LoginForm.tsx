'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = username.trim()
    if (!trimmed) {
      setError('Please enter a username.')
      return
    }
    setError('')
    setLoading(true)
    localStorage.setItem('whop_username', trimmed)
    router.push('/dashboard')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="username"
          className="text-sm font-medium text-whop-dust"
        >
          Username
        </label>
        <input
          id="username"
          type="text"
          autoComplete="username"
          autoFocus
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
          className="
            w-full px-4 py-3 rounded-lg
            bg-white/5 border border-white/10
            text-whop-off-white placeholder-white/25
            text-sm
            outline-none
            focus:border-whop-orange focus:ring-1 focus:ring-whop-orange
            transition-colors duration-150
          "
        />
        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="
          w-full py-3 px-4 rounded-lg
          bg-whop-orange hover:bg-[#e03d10]
          text-white font-medium text-sm
          transition-colors duration-150
          disabled:opacity-60 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-whop-orange focus:ring-offset-2 focus:ring-offset-whop-charcoal
        "
      >
        {loading ? 'Signing in…' : 'Continue'}
      </button>
    </form>
  )
}
