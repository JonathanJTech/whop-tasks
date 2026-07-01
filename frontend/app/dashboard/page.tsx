'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Task {
  id: number
  name: string
  price: number
  owner: string
  status: string
  completed_by?: string | null
}

const API = 'http://localhost:4000'

export default function DashboardPage() {
  const [username, setUsername] = useState<string | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCompleted, setShowCompleted] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('whop_username')
    if (!stored) {
      router.replace('/')
      return
    }
    setUsername(stored)
  }, [router])

  useEffect(() => {
    if (username) fetchTasks(showCompleted)
  }, [username, showCompleted])

  async function fetchTasks(includeCompleted = false) {
    try {
      const url = includeCompleted ? `${API}/tasks?includeCompleted=true` : `${API}/tasks`
      const res = await fetch(url)
      const data: Task[] = await res.json()
      setTasks(data)
    } catch {
      setError('Could not reach the backend. Is it running?')
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!name.trim() || !price) return
    setCreating(true)
    try {
      const res = await fetch(`${API}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), price: parseFloat(price), owner: username }),
      })
      if (!res.ok) {
        const { error: msg } = await res.json()
        setError(msg ?? 'Failed to create task')
        return
      }
      setName('')
      setPrice('')
      await fetchTasks(showCompleted)
    } catch {
      setError('Could not reach the backend. Is it running?')
    } finally {
      setCreating(false)
    }
  }

  async function handleStatusAction(id: number, action: 'complete' | 'approve' | 'deny') {
    setError(null)
    try {
      const res = await fetch(`${API}/tasks/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, action }),
      })
      if (!res.ok) {
        const { error: msg } = await res.json()
        setError(msg ?? 'Failed to update task status')
        return
      }
      await fetchTasks(showCompleted)
    } catch {
      setError('Could not reach the backend. Is it running?')
    }
  }

  async function handleEditSave(id: number) {
    if (!editName.trim() || !editPrice) return
    setError(null)
    try {
      const res = await fetch(`${API}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim(), price: parseFloat(editPrice), owner: username }),
      })
      if (!res.ok) {
        const { error: msg } = await res.json()
        setError(msg ?? 'Failed to update task')
        return
      }
      setEditingId(null)
      await fetchTasks(showCompleted)
    } catch {
      setError('Could not reach the backend. Is it running?')
    }
  }

  async function handleDelete(id: number) {
    try {
      const res = await fetch(`${API}/tasks/${id}?username=${encodeURIComponent(username!)}`, { method: 'DELETE' })
      if (!res.ok) {
        const { error: msg } = await res.json()
        setError(msg ?? 'Failed to delete task')
        return
      }
      setTasks((prev) => prev.filter((t) => t.id !== id))
    } catch {
      setError('Could not reach the backend. Is it running?')
    }
  }

  function handleLogout() {
    localStorage.removeItem('whop_username')
    router.push('/')
  }

  if (!username) return null

  const othersTasks = tasks.filter((t) => t.owner !== username && t.status !== 'completed')
  const myTasks = tasks.filter((t) => t.owner === username && (showCompleted || t.status !== 'completed'))

  return (
    <main className="min-h-screen bg-whop-charcoal flex flex-col">
      {/* Nav bar */}
      <nav className="border-b border-white/[0.08] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-whop-orange flex items-center justify-center">
            <span className="text-white font-semibold text-sm leading-none select-none">W</span>
          </div>
          <span className="text-whop-off-white font-semibold text-lg tracking-tight">Whop</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-whop-dust text-sm">{username}</span>
          <button
            onClick={handleLogout}
            className="text-sm px-3 py-1.5 rounded-lg border border-white/10 text-whop-dust hover:border-white/20 hover:text-whop-off-white transition-colors duration-150"
          >
            Log out
          </button>
        </div>
      </nav>

      <div className="flex-1 px-6 py-8 w-full max-w-6xl mx-auto grid grid-cols-2 gap-8 items-start">
        {/* Left column — everyone else's tasks */}
        <div>
          <h2 className="text-whop-off-white font-semibold text-lg mb-4">Tasks</h2>
          {othersTasks.length === 0 ? (
            <p className="text-whop-dust text-sm">No tasks from others yet.</p>
          ) : (
            <ul className="space-y-2">
              {othersTasks.map((task) => {
                const isPending = task.status === 'completion_pending'
                return (
                  <li
                    key={task.id}
                    className="flex items-center justify-between bg-white/[0.04] border border-white/[0.07] rounded-xl px-4 py-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-whop-off-white text-sm">{task.name}</span>
                        {isPending && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                            Pending approval
                          </span>
                        )}
                      </div>
                      <p className="text-whop-dust text-xs mt-0.5">by {task.owner || 'unknown'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-whop-chartreuse text-sm font-medium">
                        ${task.price.toFixed(2)}
                      </span>
                      {task.status === 'created' && (
                        <button
                          onClick={() => handleStatusAction(task.id, 'complete')}
                          className="text-xs px-3 py-1.5 rounded-lg bg-whop-orange text-white font-medium hover:opacity-90 transition-opacity"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Right column — create form + my tasks */}
        <div>
          <div className="mb-8">
            <h2 className="text-whop-off-white font-semibold text-lg mb-4">Create a task</h2>
            <form onSubmit={handleCreate} className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-whop-dust text-xs mb-1.5">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Design landing page"
                  className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-whop-off-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-colors"
                  required
                />
              </div>
              <div className="w-32">
                <label className="block text-whop-dust text-xs mb-1.5">Price ($)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-whop-off-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-colors"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 rounded-lg bg-whop-orange text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity shrink-0"
              >
                {creating ? 'Adding…' : 'Add task'}
              </button>
            </form>
            {error && (
              <p className="mt-2 text-red-400 text-xs">{error}</p>
            )}
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-whop-off-white font-semibold text-lg">My tasks</h2>
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showCompleted}
                  onChange={(e) => setShowCompleted(e.target.checked)}
                  className="accent-whop-orange"
                />
                <span className="text-whop-dust text-xs">Show completed tasks</span>
              </label>
            </div>
            {myTasks.length === 0 ? (
              <p className="text-whop-dust text-sm">You haven&apos;t created any tasks yet.</p>
            ) : (
              <ul className="space-y-2">
                {myTasks.map((task) => {
                  const isPending = task.status === 'completion_pending'
                  const isCompleted = task.status === 'completed'
                  const isEditing = editingId === task.id
                  return (
                    <li
                      key={task.id}
                      className="bg-white/[0.04] border border-white/[0.07] rounded-xl px-4 py-3"
                    >
                      {isEditing ? (
                        <form
                          onSubmit={(e) => { e.preventDefault(); handleEditSave(task.id) }}
                          className="flex gap-2 items-center"
                        >
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="flex-1 bg-white/[0.05] border border-white/10 rounded-lg px-3 py-1.5 text-whop-off-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-colors"
                            required
                          />
                          <input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            min="0"
                            step="0.01"
                            className="w-24 bg-white/[0.05] border border-white/10 rounded-lg px-3 py-1.5 text-whop-off-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-colors"
                            required
                          />
                          <button
                            type="submit"
                            className="text-xs px-3 py-1.5 rounded-lg bg-whop-orange text-white font-medium hover:opacity-90 transition-opacity"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="text-whop-dust hover:text-whop-off-white transition-colors text-xs"
                          >
                            Cancel
                          </button>
                        </form>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-whop-off-white text-sm">{task.name}</span>
                              {isPending && (
                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                                  Pending approval
                                </span>
                              )}
                              {isCompleted && (
                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-whop-chartreuse/10 text-whop-chartreuse border border-whop-chartreuse/20">
                                  Completed
                                </span>
                              )}
                            </div>
                            {(isPending || isCompleted) && task.completed_by && (
                              <p className="text-whop-dust text-xs mt-0.5">
                                Completed by {task.completed_by}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-whop-chartreuse text-sm font-medium">
                              ${task.price.toFixed(2)}
                            </span>
                            {isPending && (
                              <>
                                <button
                                  onClick={() => handleStatusAction(task.id, 'approve')}
                                  className="text-xs px-3 py-1.5 rounded-lg bg-whop-chartreuse/10 text-whop-chartreuse border border-whop-chartreuse/20 font-medium hover:bg-whop-chartreuse/20 transition-colors"
                                >
                                  Approve completion
                                </button>
                                <button
                                  onClick={() => handleStatusAction(task.id, 'deny')}
                                  className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 font-medium hover:bg-red-500/20 transition-colors"
                                >
                                  Deny completion
                                </button>
                              </>
                            )}
                            {task.status === 'created' && (
                              <>
                                <button
                                  onClick={() => { setEditingId(task.id); setEditName(task.name); setEditPrice(String(task.price)) }}
                                  className="text-whop-dust hover:text-whop-off-white transition-colors text-xs"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(task.id)}
                                  className="text-whop-dust hover:text-red-400 transition-colors text-xs"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
