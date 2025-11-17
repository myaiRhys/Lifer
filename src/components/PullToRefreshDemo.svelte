<script lang="ts">
  import { pullToRefresh } from '../lib/gestures'
  import { Haptics } from '../lib/haptics'
  import LoadingState from './shared/LoadingState.svelte'
  import TaskCard from './shared/TaskCard.svelte'
  import Badge from './shared/Badge.svelte'
  import type { Task } from '../lib/types'

  /**
   * Demo tasks for pull-to-refresh
   */
  let tasks: Task[] = [
    {
      id: '1',
      title: 'Morning meditation',
      description: 'Start the day with mindfulness',
      completed: false,
      priority: 'high',
      xpReward: 10,
      tags: ['wellness', 'morning']
    },
    {
      id: '2',
      title: 'Review goals',
      description: 'Check progress on weekly goals',
      completed: true,
      priority: 'medium',
      xpReward: 5,
      tags: ['planning']
    },
    {
      id: '3',
      title: 'Exercise 30 min',
      description: 'Get some physical activity',
      completed: false,
      priority: 'high',
      xpReward: 15,
      tags: ['health', 'exercise']
    }
  ]

  let isRefreshing = false
  let lastRefreshTime: Date | null = null
  let refreshCount = 0

  /**
   * Simulates fetching new data
   */
  async function handleRefresh() {
    isRefreshing = true
    refreshCount++

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Add a new task to demonstrate refresh
    const newTask: Task = {
      id: `${Date.now()}`,
      title: `New task from refresh #${refreshCount}`,
      description: 'This task was added via pull-to-refresh',
      completed: false,
      priority: 'low',
      xpReward: 5,
      tags: ['new']
    }

    tasks = [newTask, ...tasks]
    lastRefreshTime = new Date()
    isRefreshing = false

    // Success haptic feedback
    Haptics.success()
  }

  function handleTaskToggle(taskId: string, completed: boolean) {
    tasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed } : task
    )
  }

  function formatTime(date: Date | null): string {
    if (!date) return 'Never'
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSec = Math.floor(diffMs / 1000)

    if (diffSec < 60) return `${diffSec}s ago`
    const diffMin = Math.floor(diffSec / 60)
    if (diffMin < 60) return `${diffMin}m ago`
    const diffHour = Math.floor(diffMin / 60)
    return `${diffHour}h ago`
  }
</script>

<div class="demo-container">
  <!-- Header -->
  <header class="demo-header">
    <h1 class="text-h4 font-bold text-text-primary">Pull to Refresh Demo</h1>
    <p class="text-body text-text-secondary mt-8">
      Swipe down from the top to refresh the task list
    </p>

    <!-- Stats -->
    <div class="flex gap-16 mt-16">
      <Badge variant="streak" value={refreshCount}>
        <span class="mr-4">🔄</span> Refreshes
      </Badge>
      {#if lastRefreshTime}
        <Badge variant="achievement" tier="silver">
          <span class="mr-4">⏰</span> {formatTime(lastRefreshTime)}
        </Badge>
      {/if}
    </div>
  </header>

  <!-- Scrollable content with pull-to-refresh -->
  <div
    class="demo-content"
    use:pullToRefresh={{
      threshold: 80,
      onRefresh: handleRefresh,
      haptics: true
    }}
  >
    {#if isRefreshing}
      <div class="refresh-indicator">
        <LoadingState variant="spinner" size="md" message="Refreshing..." />
      </div>
    {/if}

    <!-- Instruction card -->
    <div class="instruction-card">
      <div class="text-center">
        <div class="text-6xl mb-16">👆</div>
        <h3 class="text-h6 font-semibold text-text-primary mb-8">
          Try Pull-to-Refresh!
        </h3>
        <p class="text-body-small text-text-secondary">
          Drag down from the top of the list to fetch new tasks. You'll feel haptic feedback when the threshold is reached.
        </p>
      </div>
    </div>

    <!-- Task list -->
    <div class="task-list">
      {#each tasks as task (task.id)}
        <TaskCard
          {task}
          enableSwipe={true}
          onToggle={(completed) => handleTaskToggle(task.id, completed)}
        />
      {/each}
    </div>

    <!-- Empty state if no tasks -->
    {#if tasks.length === 0}
      <div class="empty-state">
        <div class="text-6xl mb-16">📝</div>
        <p class="text-body text-text-secondary">
          No tasks yet. Pull down to refresh!
        </p>
      </div>
    {/if}
  </div>
</div>

<style>
  .demo-container {
    min-height: 100vh;
    background: var(--bg-primary);
    display: flex;
    flex-direction: column;
  }

  /* Header */
  .demo-header {
    position: sticky;
    top: 0;
    z-index: 10;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border);
    padding: 24px 16px;
    box-shadow: var(--shadow-elevation-2);
  }

  /* Content area */
  .demo-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    position: relative;
    -webkit-overflow-scrolling: touch;
  }

  /* Refresh indicator */
  .refresh-indicator {
    position: sticky;
    top: 0;
    z-index: 5;
    background: var(--bg-primary);
    padding: 16px;
    margin: -16px -16px 16px -16px;
    border-bottom: 1px solid var(--border);
  }

  /* Instruction card */
  .instruction-card {
    background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
    border: 2px dashed var(--border);
    border-radius: 16px;
    padding: 32px 24px;
    margin-bottom: 24px;
    animation: instructionPulse 3s ease-in-out infinite;
  }

  @keyframes instructionPulse {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.02);
      opacity: 0.95;
    }
  }

  /* Task list */
  .task-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /* Empty state */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 64px 24px;
    text-align: center;
  }

  /* Responsive */
  @media (min-width: 768px) {
    .demo-header {
      padding: 32px 48px;
    }

    .demo-content {
      padding: 32px 48px;
      max-width: 800px;
      margin: 0 auto;
      width: 100%;
    }
  }
</style>
