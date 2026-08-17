<script setup lang="ts">
const props = defineProps<{ todo: Todo }>()
const emit = defineEmits<{
  toggle: [id: string]
  remove: [id: string]
  update: [id: string, title: string]
}>()

const editing = ref(false)
const draft = ref(props.todo.title)
const inputRef = ref()

function startEditing() {
  draft.value = props.todo.title
  editing.value = true
  nextTick(() => inputRef.value?.inputRef?.focus?.())
}

function commit() {
  if (!editing.value) return
  editing.value = false
  const trimmed = draft.value.trim()
  if (trimmed && trimmed !== props.todo.title) {
    emit('update', props.todo.id, trimmed)
  } else {
    draft.value = props.todo.title
  }
}

function cancel() {
  editing.value = false
  draft.value = props.todo.title
}
</script>

<template>
  <div
    class="group flex items-center gap-3 rounded-lg border border-default bg-default px-3 py-2.5 transition-colors hover:bg-elevated/50"
  >
    <UCheckbox
      :model-value="todo.done"
      @update:model-value="emit('toggle', todo.id)"
      :aria-label="`Mark ${todo.title} as ${todo.done ? 'active' : 'complete'}`"
    />

    <UInput
      v-if="editing"
      ref="inputRef"
      v-model="draft"
      class="flex-1"
      size="sm"
      @keydown.enter="commit"
      @keydown.esc="cancel"
      @blur="commit"
    />
    <span
      v-else
      class="flex-1 cursor-text truncate text-sm"
      :class="todo.done ? 'text-dimmed line-through' : 'text-default'"
      @dblclick="startEditing"
    >
      {{ todo.title }}
    </span>

    <div class="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
      <UButton
        v-if="!editing"
        icon="i-lucide-pencil"
        color="neutral"
        variant="ghost"
        size="xs"
        aria-label="Edit todo"
        @click="startEditing"
      />
      <UButton
        icon="i-lucide-trash-2"
        color="error"
        variant="ghost"
        size="xs"
        aria-label="Delete todo"
        @click="emit('remove', todo.id)"
      />
    </div>
  </div>
</template>
