import { neon } from '@neondatabase/serverless'

export const sql = neon(process.env.DATABASE_URL!)

export interface TodoRow {
  id: number
  title: string
  completed: boolean
  created_at: Date
}

export interface Todo {
  id: string
  title: string
  done: boolean
  createdAt: number
}

export function toTodo(row: TodoRow): Todo {
  return {
    id: String(row.id),
    title: row.title,
    done: row.completed,
    createdAt: new Date(row.created_at).getTime(),
  }
}
