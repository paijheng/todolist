import { describe, it, expect, beforeEach } from 'vitest'
import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import type { TodoFilter } from '~/composables/useTodos'
import IndexPage from '~/pages/index.vue'

describe('Todolist', () => {
  beforeEach(() => {
    clearNuxtData()
    useState<TodoFilter>('todos-filter').value = 'all'
  })

  describe('Rendering', () => {
    it('renders empty state when no todos', async () => {
      const wrapper = await mountSuspended(IndexPage)
      expect(wrapper.text()).toContain('No todos yet')
    })

    it('renders existing todos', async () => {
      registerEndpoint('/api/todos', {
        handler: () => [
          { id: '1', title: 'Buy groceries', done: false, createdAt: Date.now() },
          { id: '2', title: 'Walk the dog', done: true, createdAt: Date.now() },
        ],
        once: true
      })
      const wrapper = await mountSuspended(IndexPage)
      expect(wrapper.text()).toContain('Buy groceries')
      expect(wrapper.text()).toContain('Walk the dog')
    })

    it('shows active count', async () => {
      registerEndpoint('/api/todos', {
        handler: () => [
          { id: '1', title: 'Buy groceries', done: false, createdAt: Date.now() },
          { id: '2', title: 'Walk the dog', done: true, createdAt: Date.now() },
        ],
        once: true
      })
      const wrapper = await mountSuspended(IndexPage)
      expect(wrapper.text()).toContain('1 task left')
    })

    it('uses plural form for multiple tasks', async () => {
      registerEndpoint('/api/todos', {
        handler: () => [
          { id: '1', title: 'Buy groceries', done: false, createdAt: Date.now() },
          { id: '2', title: 'Walk the dog', done: false, createdAt: Date.now() },
        ],
        once: true
      })
      const wrapper = await mountSuspended(IndexPage)
      expect(wrapper.text()).toContain('2 tasks left')
    })
  })

  describe('Adding todos', () => {
    it('adds a todo via form submission', async () => {
      registerEndpoint('/api/todos', {
        method: 'POST',
        handler: () => ({ id: '1', title: 'Buy groceries', done: false, createdAt: Date.now() }),
        once: true
      })
      const wrapper = await mountSuspended(IndexPage)
      const input = wrapper.find('input[placeholder="What needs to be done?"]')
      await input.setValue('Buy groceries')
      await wrapper.find('form').trigger('submit')
      await expect.poll(() => wrapper.text()).toContain('Buy groceries')
    })

    it('clears input after adding', async () => {
      registerEndpoint('/api/todos', {
        method: 'POST',
        handler: () => ({ id: '1', title: 'Buy groceries', done: false, createdAt: Date.now() }),
        once: true
      })
      const wrapper = await mountSuspended(IndexPage)
      const input = wrapper.find('input[placeholder="What needs to be done?"]')
      await input.setValue('Buy groceries')
      await wrapper.find('form').trigger('submit')
      await expect.poll(() => (input.element as HTMLInputElement).value).toBe('')
    })

    it('does not add empty or whitespace-only todo', async () => {
      const wrapper = await mountSuspended(IndexPage)
      const input = wrapper.find('input[placeholder="What needs to be done?"]')
      await input.setValue('   ')
      await wrapper.find('form').trigger('submit')
      expect(wrapper.text()).toContain('No todos yet')
    })

    it('disables add button when input is empty', async () => {
      const wrapper = await mountSuspended(IndexPage)
      const button = wrapper.find('button[type="submit"]')
      expect((button.element as HTMLButtonElement).disabled).toBe(true)
    })

    it('enables add button when input has text', async () => {
      const wrapper = await mountSuspended(IndexPage)
      const input = wrapper.find('input[placeholder="What needs to be done?"]')
      await input.setValue('Buy groceries')
      const button = wrapper.find('button[type="submit"]')
      expect((button.element as HTMLButtonElement).disabled).toBe(false)
    })
  })

  describe('Toggling todos', () => {
    it('toggles a todo via checkbox', async () => {
      registerEndpoint('/api/todos', {
        handler: () => [{ id: '1', title: 'Buy groceries', done: false, createdAt: Date.now() }],
        once: true
      })
      registerEndpoint('/api/todos/1', {
        method: 'PATCH',
        handler: () => ({ id: '1', title: 'Buy groceries', done: true, createdAt: Date.now() }),
        once: true
      })
      const wrapper = await mountSuspended(IndexPage)
      expect(wrapper.find('span.flex-1').classes()).not.toContain('line-through')
      const checkbox = wrapper.find('[role="checkbox"]')
      await checkbox.trigger('click')
      await expect.poll(() => wrapper.find('span.flex-1').classes()).toContain('line-through')
    })

    it('updates active count after toggle', async () => {
      registerEndpoint('/api/todos', {
        handler: () => [
          { id: '1', title: 'Buy groceries', done: false, createdAt: Date.now() },
          { id: '2', title: 'Walk the dog', done: false, createdAt: Date.now() },
        ],
        once: true
      })
      registerEndpoint('/api/todos/1', {
        method: 'PATCH',
        handler: () => ({ id: '1', title: 'Buy groceries', done: true, createdAt: Date.now() }),
        once: true
      })
      const wrapper = await mountSuspended(IndexPage)
      expect(wrapper.text()).toContain('2 tasks left')
      const checkbox = wrapper.find('[role="checkbox"]')
      await checkbox.trigger('click')
      await expect.poll(() => wrapper.text()).toContain('1 task left')
    })

    it('applies strikethrough style when done', async () => {
      registerEndpoint('/api/todos', {
        handler: () => [{ id: '1', title: 'Buy groceries', done: true, createdAt: Date.now() }],
        once: true
      })
      const wrapper = await mountSuspended(IndexPage)
      const span = wrapper.find('span.flex-1')
      expect(span.classes()).toContain('line-through')
    })
  })

  describe('Editing todos', () => {
    it('enters edit mode on double-click', async () => {
      registerEndpoint('/api/todos', {
        handler: () => [{ id: '1', title: 'Buy groceries', done: false, createdAt: Date.now() }],
        once: true
      })
      const wrapper = await mountSuspended(IndexPage)
      const span = wrapper.find('span.flex-1')
      await span.trigger('dblclick')
      expect(wrapper.findAll('input').length).toBeGreaterThan(1)
    })

    it('enters edit mode on pencil button click', async () => {
      registerEndpoint('/api/todos', {
        handler: () => [{ id: '1', title: 'Buy groceries', done: false, createdAt: Date.now() }],
        once: true
      })
      const wrapper = await mountSuspended(IndexPage)
      const editButton = wrapper.find('button[aria-label="Edit todo"]')
      await editButton.trigger('click')
      expect(wrapper.findAll('input').length).toBeGreaterThan(1)
    })

    it('commits edit on Enter', async () => {
      registerEndpoint('/api/todos', {
        handler: () => [{ id: '1', title: 'Buy groceries', done: false, createdAt: Date.now() }],
        once: true
      })
      registerEndpoint('/api/todos/1', {
        method: 'PATCH',
        handler: () => ({ id: '1', title: 'Buy milk', done: false, createdAt: Date.now() }),
        once: true
      })
      const wrapper = await mountSuspended(IndexPage)
      const span = wrapper.find('span.flex-1')
      await span.trigger('dblclick')
      const editInput = wrapper.findAll('input')[1]
      await editInput!.setValue('Buy milk')
      await editInput!.trigger('keydown.enter')
      await expect.poll(() => wrapper.text()).toContain('Buy milk')
    })

    it('commits edit on blur', async () => {
      registerEndpoint('/api/todos', {
        handler: () => [{ id: '1', title: 'Buy groceries', done: false, createdAt: Date.now() }],
        once: true
      })
      registerEndpoint('/api/todos/1', {
        method: 'PATCH',
        handler: () => ({ id: '1', title: 'Buy milk', done: false, createdAt: Date.now() }),
        once: true
      })
      const wrapper = await mountSuspended(IndexPage)
      const span = wrapper.find('span.flex-1')
      await span.trigger('dblclick')
      const editInput = wrapper.findAll('input')[1]
      await editInput!.setValue('Buy milk')
      await editInput!.trigger('blur')
      await expect.poll(() => wrapper.text()).toContain('Buy milk')
    })

    it('cancels edit on Escape', async () => {
      registerEndpoint('/api/todos', {
        handler: () => [{ id: '1', title: 'Buy groceries', done: false, createdAt: Date.now() }],
        once: true
      })
      const wrapper = await mountSuspended(IndexPage)
      const span = wrapper.find('span.flex-1')
      await span.trigger('dblclick')
      const editInput = wrapper.findAll('input')[1]
      await editInput!.setValue('Buy milk')
      await editInput!.trigger('keydown.esc')
      expect(wrapper.text()).toContain('Buy groceries')
    })

    it('does not save empty title on edit', async () => {
      registerEndpoint('/api/todos', {
        handler: () => [{ id: '1', title: 'Buy groceries', done: false, createdAt: Date.now() }],
        once: true
      })
      const wrapper = await mountSuspended(IndexPage)
      const span = wrapper.find('span.flex-1')
      await span.trigger('dblclick')
      const editInput = wrapper.findAll('input')[1]
      await editInput!.setValue('   ')
      await editInput!.trigger('keydown.enter')
      expect(wrapper.text()).toContain('Buy groceries')
    })
  })

  describe('Deleting todos', () => {
    it('deletes a todo', async () => {
      registerEndpoint('/api/todos', {
        handler: () => [{ id: '1', title: 'Buy groceries', done: false, createdAt: Date.now() }],
        once: true
      })
      registerEndpoint('/api/todos/1', {
        method: 'DELETE',
        handler: () => ({ deleted: 1 }),
        once: true
      })
      const wrapper = await mountSuspended(IndexPage)
      expect(wrapper.text()).toContain('Buy groceries')
      const deleteButton = wrapper.find('button[aria-label="Delete todo"]')
      await deleteButton.trigger('click')
      await expect.poll(() => wrapper.text()).not.toContain('Buy groceries')
    })
  })

  describe('Filtering', () => {
    it('shows all todos by default', async () => {
      registerEndpoint('/api/todos', {
        handler: () => [
          { id: '1', title: 'Buy groceries', done: false, createdAt: Date.now() },
          { id: '2', title: 'Walk the dog', done: true, createdAt: Date.now() },
        ],
        once: true
      })
      const wrapper = await mountSuspended(IndexPage)
      expect(wrapper.text()).toContain('Buy groceries')
      expect(wrapper.text()).toContain('Walk the dog')
    })

    it('filters by active', async () => {
      registerEndpoint('/api/todos', {
        handler: () => [
          { id: '1', title: 'Buy groceries', done: false, createdAt: Date.now() },
          { id: '2', title: 'Walk the dog', done: true, createdAt: Date.now() },
        ],
        once: true
      })
      const wrapper = await mountSuspended(IndexPage)
      const activeButton = wrapper.findAll('button').find(b => b.text() === 'Active')
      await activeButton!.trigger('click')
      expect(wrapper.text()).toContain('Buy groceries')
      expect(wrapper.text()).not.toContain('Walk the dog')
    })

    it('filters by completed', async () => {
      registerEndpoint('/api/todos', {
        handler: () => [
          { id: '1', title: 'Buy groceries', done: false, createdAt: Date.now() },
          { id: '2', title: 'Walk the dog', done: true, createdAt: Date.now() },
        ],
        once: true
      })
      const wrapper = await mountSuspended(IndexPage)
      const completedButton = wrapper.findAll('button').find(b => b.text() === 'Completed')
      await completedButton!.trigger('click')
      expect(wrapper.text()).toContain('Walk the dog')
      expect(wrapper.text()).not.toContain('Buy groceries')
    })

    it('shows empty state for active filter when no active todos', async () => {
      registerEndpoint('/api/todos', {
        handler: () => [
          { id: '1', title: 'Buy groceries', done: true, createdAt: Date.now() },
        ],
        once: true
      })
      const wrapper = await mountSuspended(IndexPage)
      const activeButton = wrapper.findAll('button').find(b => b.text() === 'Active')
      await activeButton!.trigger('click')
      expect(wrapper.text()).toContain('Nothing active')
    })

    it('shows empty state for completed filter when no completed todos', async () => {
      registerEndpoint('/api/todos', {
        handler: () => [
          { id: '1', title: 'Buy groceries', done: false, createdAt: Date.now() },
        ],
        once: true
      })
      const wrapper = await mountSuspended(IndexPage)
      const completedButton = wrapper.findAll('button').find(b => b.text() === 'Completed')
      await completedButton!.trigger('click')
      expect(wrapper.text()).toContain('No completed tasks yet')
    })
  })

  describe('Clear completed', () => {
    it('shows clear button when there are completed todos', async () => {
      registerEndpoint('/api/todos', {
        handler: () => [
          { id: '1', title: 'Buy groceries', done: false, createdAt: Date.now() },
          { id: '2', title: 'Walk the dog', done: true, createdAt: Date.now() },
        ],
        once: true
      })
      const wrapper = await mountSuspended(IndexPage)
      const clearButton = wrapper.findAll('button').find(b => b.text() === 'Clear completed')
      expect(clearButton).toBeDefined()
    })

    it('hides clear button when no completed todos', async () => {
      registerEndpoint('/api/todos', {
        handler: () => [
          { id: '1', title: 'Buy groceries', done: false, createdAt: Date.now() },
        ],
        once: true
      })
      const wrapper = await mountSuspended(IndexPage)
      const clearButton = wrapper.findAll('button').find(b => b.text() === 'Clear completed')
      expect(clearButton).toBeUndefined()
    })

    it('clears completed todos on click', async () => {
      registerEndpoint('/api/todos', {
        handler: () => [
          { id: '1', title: 'Buy groceries', done: false, createdAt: Date.now() },
          { id: '2', title: 'Walk the dog', done: true, createdAt: Date.now() },
        ],
        once: true
      })
      registerEndpoint('/api/todos/completed', {
        method: 'DELETE',
        handler: () => ({ deleted: 1 }),
        once: true
      })
      const wrapper = await mountSuspended(IndexPage)
      expect(wrapper.text()).toContain('Walk the dog')
      const clearButton = wrapper.findAll('button').find(b => b.text() === 'Clear completed')
      await clearButton!.trigger('click')
      await expect.poll(() => wrapper.text()).toContain('Buy groceries')
      await expect.poll(() => wrapper.text()).not.toContain('Walk the dog')
    })
  })
})
