export interface Todo {
  id: string
  title: string
  done: boolean
  createdAt: number
}

export type TodoFilter = 'all' | 'active' | 'completed'

export function useTodos() {
  // Shared, SSR-friendly state across components
  const todos = useState<Todo[]>('todos', () => [])
  const filter = useState<TodoFilter>('todos-filter', () => 'all')

  const addTodo = (title: string) => {
    const trimmed = title.trim()
    if (!trimmed) return
    todos.value.unshift({
      id: crypto.randomUUID(),
      title: trimmed,
      done: false,
      createdAt: Date.now(),
    })
  }

  const toggleTodo = (id: string) => {
    const todo = todos.value.find((t) => t.id === id)
    if (todo) todo.done = !todo.done
  }

  const updateTodo = (id: string, title: string) => {
    const trimmed = title.trim()
    const todo = todos.value.find((t) => t.id === id)
    if (todo && trimmed) todo.title = trimmed
  }

  const removeTodo = (id: string) => {
    todos.value = todos.value.filter((t) => t.id !== id)
  }

  const clearCompleted = () => {
    todos.value = todos.value.filter((t) => !t.done)
  }

  const filteredTodos = computed(() => {
    switch (filter.value) {
      case 'active':
        return todos.value.filter((t) => !t.done)
      case 'completed':
        return todos.value.filter((t) => t.done)
      default:
        return todos.value
    }
  })

  const activeCount = computed(() => todos.value.filter((t) => !t.done).length)
  const completedCount = computed(() => todos.value.filter((t) => t.done).length)

  return {
    todos,
    filter,
    filteredTodos,
    activeCount,
    completedCount,
    addTodo,
    toggleTodo,
    updateTodo,
    removeTodo,
    clearCompleted,
  }
}
