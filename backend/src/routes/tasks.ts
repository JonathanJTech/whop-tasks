import { Router, Request, Response } from 'express'
import db from '../db'

const router = Router()

router.get('/', (req: Request, res: Response) => {
  const includeCompleted = req.query.includeCompleted === 'true'
  const tasks = includeCompleted
    ? db.prepare('SELECT * FROM tasks ORDER BY id DESC').all()
    : db.prepare("SELECT * FROM tasks WHERE status != 'completed' ORDER BY id DESC").all()
  res.json(tasks)
})

router.post('/', (req: Request, res: Response) => {
  const { name, price, owner } = req.body as { name?: string; price?: number; owner?: string }

  if (!name || typeof name !== 'string' || name.trim() === '') {
    res.status(400).json({ error: 'name is required' })
    return
  }
  if (price === undefined || typeof price !== 'number' || isNaN(price)) {
    res.status(400).json({ error: 'price must be a number' })
    return
  }
  if (!owner || typeof owner !== 'string' || owner.trim() === '') {
    res.status(400).json({ error: 'owner is required' })
    return
  }

  const result = db
    .prepare('INSERT INTO tasks (name, price, owner) VALUES (?, ?, ?)')
    .run(name.trim(), price, owner.trim())

  const task = db
    .prepare('SELECT * FROM tasks WHERE id = ?')
    .get(result.lastInsertRowid)

  res.status(201).json(task)
})

router.put('/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const { name, price, owner } = req.body as { name?: string; price?: number; owner?: string }

  if (!name || typeof name !== 'string' || name.trim() === '') {
    res.status(400).json({ error: 'name is required' })
    return
  }
  if (price === undefined || typeof price !== 'number' || isNaN(price)) {
    res.status(400).json({ error: 'price must be a number' })
    return
  }
  if (!owner || typeof owner !== 'string' || owner.trim() === '') {
    res.status(400).json({ error: 'owner is required' })
    return
  }

  const existing = db.prepare('SELECT id FROM tasks WHERE id = ?').get(id)
  if (!existing) {
    res.status(404).json({ error: 'task not found' })
    return
  }

  db.prepare('UPDATE tasks SET name = ?, price = ?, owner = ? WHERE id = ?').run(
    name.trim(),
    price,
    owner.trim(),
    id
  )

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id)
  res.json(task)
})

router.delete('/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const { username } = req.query as { username?: string }

  if (!username || username.trim() === '') {
    res.status(400).json({ error: 'username is required' })
    return
  }

  const existing = db.prepare('SELECT id, owner FROM tasks WHERE id = ?').get(id) as { id: number; owner: string } | undefined
  if (!existing) {
    res.status(404).json({ error: 'task not found' })
    return
  }

  if (existing.owner !== username.trim()) {
    res.status(403).json({ error: 'you can only delete your own tasks' })
    return
  }

  db.prepare('DELETE FROM tasks WHERE id = ?').run(id)
  res.status(204).send()
})

router.patch('/:id/status', (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const { username, action } = req.body as { username?: string; action?: string }

  if (!username || typeof username !== 'string' || username.trim() === '') {
    res.status(400).json({ error: 'username is required' })
    return
  }
  if (!action || !['complete', 'approve', 'deny'].includes(action)) {
    res.status(400).json({ error: 'action must be complete, approve, or deny' })
    return
  }

  const task = db.prepare('SELECT id, owner, status FROM tasks WHERE id = ?').get(id) as { id: number; owner: string; status: string } | undefined
  if (!task) {
    res.status(404).json({ error: 'task not found' })
    return
  }

  const user = username.trim()
  const isOwner = task.owner === user

  if (action === 'complete') {
    if (isOwner) {
      res.status(403).json({ error: 'you cannot complete your own task' })
      return
    }
    if (task.status !== 'created') {
      res.status(400).json({ error: 'task is not in created state' })
      return
    }
    db.prepare("UPDATE tasks SET status = 'completion_pending', completed_by = ? WHERE id = ?").run(user, id)
  } else if (action === 'approve') {
    if (!isOwner) {
      res.status(403).json({ error: 'only the owner can approve completion' })
      return
    }
    if (task.status !== 'completion_pending') {
      res.status(400).json({ error: 'task is not pending completion' })
      return
    }
    db.prepare("UPDATE tasks SET status = 'completed' WHERE id = ?").run(id)
  } else if (action === 'deny') {
    if (!isOwner) {
      res.status(403).json({ error: 'only the owner can deny completion' })
      return
    }
    if (task.status !== 'completion_pending') {
      res.status(400).json({ error: 'task is not pending completion' })
      return
    }
    db.prepare("UPDATE tasks SET status = 'created', completed_by = NULL WHERE id = ?").run(id)
  }

  const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id)
  res.json(updated)
})

export default router
