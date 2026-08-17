export interface Todo {
  id: string
  title: string
  done: boolean
  createdAt: number
}

export type TodoFilter = 'all' | 'active' | 'completed'

export async function useTodos() {
  const filter = useState<TodoFilter>('todos-filter', () => 'all')

  const { data: todos, refresh } = await useFetch<Todo[]>('/api/todos', { default: () => [] })

  const addTodo = async (title: string) => {
    const trimmed = title.trim()
    if (!trimmed) return
    const created = await $fetch<Todo>('/api/todos', {
      method: 'POST',
      body: { title: trimmed, completed: false },
    })
    todos.value = [created, ...todos.value]
  }

  const toggleTodo = async (id: string) => {
    const todo = todos.value.find((t) => t.id === id)
    if (!todo) return
    const updated = await $fetch<Todo>(`/api/todos/${id}`, {
      method: 'PATCH',
      body: { completed: !todo.done },
    })
    todos.value = todos.value.map((t) => (t.id === id ? updated : t))
  }

  const updateTodo = async (id: string, title: string) => {
    const trimmed = title.trim()
    if (!trimmed) return
    const updated = await $fetch<Todo>(`/api/todos/${id}`, {
      method: 'PATCH',
      body: { title: trimmed },
    })
    todos.value = todos.value.map((t) => (t.id === id ? updated : t))
  }

  const removeTodo = async (id: string) => {
    await $fetch(`/api/todos/${id}`, { method: 'DELETE' })
    todos.value = todos.value.filter((t) => t.id !== id)
  }

  const clearCompleted = async () => {
    await $fetch('/api/todos/completed', { method: 'DELETE' })
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
    refresh,
  }
}
