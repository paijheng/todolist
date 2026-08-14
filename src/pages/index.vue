<script setup lang="ts">
import { useTodos, type TodoFilter } from '~/composables/useTodos'

const {
  filter,
  filteredTodos,
  activeCount,
  completedCount,
  addTodo,
  toggleTodo,
  updateTodo,
  removeTodo,
  clearCompleted,
} = useTodos()

const newTodo = ref('')

async function submit() {
  await addTodo(newTodo.value)
  newTodo.value = ''
}

const filters: { label: string; value: TodoFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
]
</script>

<template>
  <main class="min-h-screen bg-muted/30 px-4 py-10 sm:py-16">
    <div class="mx-auto w-full max-w-xl">
      <header class="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold tracking-tight text-highlighted">Todos</h1>
          <p class="mt-1 text-sm text-muted">
            {{ activeCount }} {{ activeCount === 1 ? 'task' : 'tasks' }} left to do
          </p>
        </div>
        <UColorModeButton />
      </header>

      <UCard>
        <form class="flex gap-2" @submit.prevent="submit">
          <UInput
            v-model="newTodo"
            placeholder="What needs to be done?"
            icon="i-lucide-plus"
            size="lg"
            class="flex-1"
            autofocus
          />
          <UButton type="submit" size="lg" :disabled="!newTodo.trim()"> Add </UButton>
        </form>

        <div class="mt-5 flex items-center justify-between gap-2">
          <div class="flex gap-1">
            <UButton
              v-for="f in filters"
              :key="f.value"
              :color="filter === f.value ? 'primary' : 'neutral'"
              :variant="filter === f.value ? 'soft' : 'ghost'"
              size="xs"
              @click="filter = f.value"
            >
              {{ f.label }}
            </UButton>
          </div>
          <UButton
            v-if="completedCount > 0"
            color="neutral"
            variant="ghost"
            size="xs"
            icon="i-lucide-eraser"
            @click="clearCompleted"
          >
            Clear completed
          </UButton>
        </div>

        <div class="mt-4 flex flex-col gap-2">
          <TransitionGroup
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in absolute"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <TodoItem
              v-for="todo in filteredTodos"
              :key="todo.id"
              :todo="todo"
              @toggle="toggleTodo"
              @remove="removeTodo"
              @update="updateTodo"
            />
          </TransitionGroup>

          <div
            v-if="filteredTodos.length === 0"
            class="flex flex-col items-center gap-2 rounded-lg border border-dashed border-default py-12 text-center"
          >
            <UIcon name="i-lucide-clipboard-check" class="size-8 text-dimmed" />
            <p class="text-sm text-muted">
              {{ filter === 'completed' ? 'No completed tasks yet.' : filter === 'active' ? 'Nothing active — nice work!' : 'No todos yet. Add one above.' }}
            </p>
          </div>
        </div>
      </UCard>

      <p class="mt-4 text-center text-xs text-dimmed">Double-click a task to edit it.</p>
    </div>
  </main>
</template>
