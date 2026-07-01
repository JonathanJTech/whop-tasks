import db from './db'

db.exec('DELETE FROM tasks')
db.exec("DELETE FROM sqlite_sequence WHERE name = 'tasks'")

console.log('Database seeded: all tasks deleted, id sequence reset.')
