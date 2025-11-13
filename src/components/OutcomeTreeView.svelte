<script lang="ts">
  import { onMount } from 'svelte'
  import {
    getOutcomeNodes,
    getRootNodes,
    getChildNodes,
    createOutcomeNode,
    updateOutcomeNode,
    deleteOutcomeNode,
    archiveOutcomeNode,
    recalculateAllProgress
  } from '../lib/db'
  import type { OutcomeNode } from '../lib/types'

  let nodes: OutcomeNode[] = []
  let rootNodes: OutcomeNode[] = []
  let showAddForm = false
  let editingNode: OutcomeNode | null = null
  let expandedNodes: Set<string> = new Set()

  // Form state
  let formType: OutcomeNode['type'] = 'purpose'
  let formTitle = ''
  let formDescription = ''
  let formParentId: string | undefined = undefined
  let formColor = '#3b82f6'

  const nodeColors = [
    { value: '#3b82f6', label: 'Blue', class: 'bg-blue-500' },
    { value: '#8b5cf6', label: 'Purple', class: 'bg-purple-500' },
    { value: '#10b981', label: 'Green', class: 'bg-green-500' },
    { value: '#f59e0b', label: 'Orange', class: 'bg-orange-500' },
    { value: '#ef4444', label: 'Red', class: 'bg-red-500' },
    { value: '#06b6d4', label: 'Cyan', class: 'bg-cyan-500' }
  ]

  onMount(async () => {
    await loadNodes()
  })

  async function loadNodes() {
    nodes = await getOutcomeNodes()
    rootNodes = await getRootNodes()
    await recalculateAllProgress()
    nodes = await getOutcomeNodes() // Reload after recalculation
    rootNodes = await getRootNodes()
  }

  async function handleCreateNode() {
    if (!formTitle.trim()) return

    await createOutcomeNode(
      formType,
      formTitle.trim(),
      formDescription.trim(),
      formParentId,
      formColor
    )

    resetForm()
    await loadNodes()
  }

  async function handleUpdateNode() {
    if (!editingNode || !formTitle.trim()) return

    await updateOutcomeNode(editingNode.id, {
      title: formTitle.trim(),
      description: formDescription.trim(),
      color: formColor
    })

    resetForm()
    await loadNodes()
  }

  async function handleDeleteNode(nodeId: string) {
    if (confirm('Delete this node and all its children?')) {
      await deleteOutcomeNode(nodeId)
      await loadNodes()
    }
  }

  async function handleArchiveNode(nodeId: string) {
    await archiveOutcomeNode(nodeId)
    await loadNodes()
  }

  function startEdit(node: OutcomeNode) {
    editingNode = node
    formType = node.type
    formTitle = node.title
    formDescription = node.description
    formColor = node.color
    formParentId = node.parentId
    showAddForm = true
  }

  function startAddChild(parentNode: OutcomeNode) {
    formParentId = parentNode.id

    // Determine child type based on parent
    if (parentNode.type === 'purpose') {
      formType = 'outcome'
    } else {
      formType = 'milestone'
    }

    showAddForm = true
  }

  function resetForm() {
    showAddForm = false
    editingNode = null
    formType = 'purpose'
    formTitle = ''
    formDescription = ''
    formParentId = undefined
    formColor = '#3b82f6'
  }

  function toggleExpand(nodeId: string) {
    if (expandedNodes.has(nodeId)) {
      expandedNodes.delete(nodeId)
    } else {
      expandedNodes.add(nodeId)
    }
    expandedNodes = expandedNodes // Trigger reactivity
  }

  function getNodeIcon(type: OutcomeNode['type']): string {
    const icons = {
      purpose: '🎯',
      outcome: '📊',
      milestone: '🎖️'
    }
    return icons[type]
  }

  function getProgressColor(progress: number): string {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 50) return 'bg-yellow-500'
    if (progress >= 25) return 'bg-orange-500'
    return 'bg-red-500'
  }

  function getChildrenOfNode(parentId: string): OutcomeNode[] {
    return nodes.filter(n => n.parentId === parentId && n.isActive)
  }
</script>

<div class="max-w-6xl mx-auto">
  <div class="flex justify-between items-center mb-6">
    <div>
      <h2 class="text-3xl font-bold">Outcome Trees</h2>
      <p class="text-slate-400 text-sm mt-1">Map your purposes to concrete outcomes and milestones</p>
    </div>
    <button
      on:click={() => { showAddForm = true; formType = 'purpose' }}
      class="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
    >
      + New Purpose
    </button>
  </div>

  <!-- Add/Edit Form -->
  {#if showAddForm}
    <div class="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
      <h3 class="text-xl font-bold mb-4">
        {editingNode ? 'Edit' : 'Create'} {formType.charAt(0).toUpperCase() + formType.slice(1)}
      </h3>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            bind:value={formTitle}
            placeholder="What do you want to achieve?"
            class="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Description</label>
          <textarea
            bind:value={formDescription}
            placeholder="Why is this important?"
            rows="3"
            class="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Color</label>
          <div class="flex gap-2">
            {#each nodeColors as color}
              <button
                on:click={() => formColor = color.value}
                class="w-10 h-10 rounded-lg {color.class} {formColor === color.value ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800' : ''}"
                title={color.label}
              />
            {/each}
          </div>
        </div>

        <div class="flex gap-3">
          <button
            on:click={editingNode ? handleUpdateNode : handleCreateNode}
            class="flex-1 bg-blue-600 hover:bg-blue-500 p-3 rounded-lg font-medium transition-colors"
          >
            {editingNode ? 'Update' : 'Create'}
          </button>
          <button
            on:click={resetForm}
            class="px-6 bg-slate-700 hover:bg-slate-600 p-3 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Tree View -->
  {#if rootNodes.length > 0}
    <div class="space-y-4">
      {#each rootNodes as purpose}
        <div class="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
          <!-- Purpose Level -->
          <div
            class="p-4 cursor-pointer hover:bg-slate-750 transition-colors"
            style="border-left: 4px solid {purpose.color}"
            on:click={() => toggleExpand(purpose.id)}
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-2xl">{getNodeIcon('purpose')}</span>
                  <h3 class="text-xl font-bold">{purpose.title}</h3>
                  <button class="text-lg">
                    {expandedNodes.has(purpose.id) ? '▼' : '▶'}
                  </button>
                </div>
                {#if purpose.description}
                  <p class="text-sm text-slate-400 mb-3">{purpose.description}</p>
                {/if}
                <div class="flex items-center gap-4">
                  <div class="flex-1">
                    <div class="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Progress</span>
                      <span class="font-bold">{purpose.progress}%</span>
                    </div>
                    <div class="w-full bg-slate-700 rounded-full h-2">
                      <div
                        class="{getProgressColor(purpose.progress)} h-full rounded-full transition-all"
                        style="width: {purpose.progress}%"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex gap-2">
                <button
                  on:click|stopPropagation={() => startAddChild(purpose)}
                  class="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-sm transition-colors"
                >
                  + Outcome
                </button>
                <button
                  on:click|stopPropagation={() => startEdit(purpose)}
                  class="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors"
                >
                  Edit
                </button>
                <button
                  on:click|stopPropagation={() => handleDeleteNode(purpose.id)}
                  class="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>

          <!-- Outcomes Level (Children) -->
          {#if expandedNodes.has(purpose.id)}
            <div class="border-t border-slate-700 bg-slate-850">
              {#each getChildrenOfNode(purpose.id) as outcome}
                <div
                  class="p-4 ml-8 border-l-2 hover:bg-slate-800 transition-colors"
                  style="border-left-color: {outcome.color}"
                >
                  <div class="flex items-start justify-between gap-4">
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-2">
                        <span class="text-xl">{getNodeIcon('outcome')}</span>
                        <h4 class="text-lg font-semibold">{outcome.title}</h4>
                        {#if getChildrenOfNode(outcome.id).length > 0}
                          <button
                            class="text-sm"
                            on:click|stopPropagation={() => toggleExpand(outcome.id)}
                          >
                            {expandedNodes.has(outcome.id) ? '▼' : '▶'}
                          </button>
                        {/if}
                      </div>
                      {#if outcome.description}
                        <p class="text-sm text-slate-400 mb-2">{outcome.description}</p>
                      {/if}
                      <div class="flex items-center gap-3">
                        <div class="flex-1 max-w-xs">
                          <div class="flex justify-between text-xs text-slate-400 mb-1">
                            <span>Progress</span>
                            <span class="font-bold">{outcome.progress}%</span>
                          </div>
                          <div class="w-full bg-slate-700 rounded-full h-1.5">
                            <div
                              class="{getProgressColor(outcome.progress)} h-full rounded-full transition-all"
                              style="width: {outcome.progress}%"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="flex gap-2">
                      <button
                        on:click|stopPropagation={() => startAddChild(outcome)}
                        class="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-sm transition-colors"
                      >
                        + Milestone
                      </button>
                      <button
                        on:click|stopPropagation={() => startEdit(outcome)}
                        class="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        on:click|stopPropagation={() => handleDeleteNode(outcome.id)}
                        class="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-sm transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <!-- Milestones Level (Grandchildren) -->
                  {#if expandedNodes.has(outcome.id)}
                    <div class="mt-4 space-y-2 ml-6">
                      {#each getChildrenOfNode(outcome.id) as milestone}
                        <div
                          class="p-3 bg-slate-700 rounded-lg border-l-2"
                          style="border-left-color: {milestone.color}"
                        >
                          <div class="flex items-start justify-between gap-4">
                            <div class="flex-1">
                              <div class="flex items-center gap-2 mb-1">
                                <span>{getNodeIcon('milestone')}</span>
                                <h5 class="font-medium">{milestone.title}</h5>
                              </div>
                              {#if milestone.description}
                                <p class="text-xs text-slate-400 mb-2">{milestone.description}</p>
                              {/if}
                              <div class="flex items-center gap-3">
                                <div class="flex-1 max-w-xs">
                                  <div class="flex justify-between text-xs text-slate-400 mb-1">
                                    <span>{milestone.linkedTaskCount || 0} tasks</span>
                                    <span class="font-bold">{milestone.progress}%</span>
                                  </div>
                                  <div class="w-full bg-slate-600 rounded-full h-1.5">
                                    <div
                                      class="{getProgressColor(milestone.progress)} h-full rounded-full transition-all"
                                      style="width: {milestone.progress}%"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div class="flex gap-2">
                              <button
                                on:click|stopPropagation={() => startEdit(milestone)}
                                class="px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                on:click|stopPropagation={() => handleDeleteNode(milestone.id)}
                                class="px-2 py-1 bg-red-600 hover:bg-red-500 rounded text-xs transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      {/each}
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {:else}
    <div class="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
      <div class="text-6xl mb-4">🎯</div>
      <h3 class="text-xl font-bold mb-2">No outcome trees yet</h3>
      <p class="text-slate-400 mb-6">
        Create your first purpose to start mapping your goals and outcomes
      </p>
      <button
        on:click={() => { showAddForm = true; formType = 'purpose' }}
        class="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
      >
        Create Your First Purpose
      </button>
    </div>
  {/if}

  <!-- Info Box -->
  <div class="mt-6 bg-slate-800 border border-slate-700 rounded-lg p-4">
    <h4 class="font-bold mb-2">💡 How Outcome Trees Work:</h4>
    <ul class="text-sm text-slate-300 space-y-1">
      <li>• <strong>Purpose:</strong> Your big "why" - the overarching goal</li>
      <li>• <strong>Outcome:</strong> Measurable results that support your purpose</li>
      <li>• <strong>Milestone:</strong> Concrete achievements linked to tasks</li>
      <li>• Progress automatically calculated based on completed tasks</li>
      <li>• Link tasks to milestones when creating them</li>
    </ul>
  </div>
</div>
