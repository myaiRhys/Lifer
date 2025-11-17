# Design System Integration Guide

This document explains how to integrate the new design system components into existing Lifer pages.

## Components Available

### 1. **Badge Component** (`/src/components/shared/Badge.svelte`)

Display XP, levels, streaks, and achievements.

```svelte
<script>
  import Badge from './components/shared/Badge.svelte'
</script>

<!-- XP Badge -->
<Badge variant="xp" value="+50">XP</Badge>

<!-- Level Badge -->
<Badge variant="level" value="5" animate={true} />

<!-- Streak Badge -->
<Badge variant="streak" value="15" animate={true} />

<!-- Achievement Badges -->
<Badge variant="achievement" tier="bronze" value="">🏆</Badge>
<Badge variant="achievement" tier="silver" value="">🥈</Badge>
<Badge variant="achievement" tier="gold" value="" animate={true}>🥇</Badge>
```

**Props:**
- `variant`: 'xp' | 'level' | 'streak' | 'achievement'
- `value`: string | number
- `tier`: 'bronze' | 'silver' | 'gold' (for achievement variant)
- `animate`: boolean (default: false)

---

### 2. **Button Component** (`/src/components/shared/Button.svelte`)

Styled buttons with multiple variants.

```svelte
<script>
  import Button from './components/shared/Button.svelte'
</script>

<!-- Primary Button -->
<Button variant="primary" size="md" onclick={handleClick}>
  Save Task
</Button>

<!-- Secondary Button -->
<Button variant="secondary" size="lg">
  Cancel
</Button>

<!-- Ghost Button -->
<Button variant="ghost" size="sm" disabled={false}>
  Delete
</Button>

<!-- Full Width Button -->
<Button variant="primary" fullWidth={true}>
  Submit
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'ghost' (default: 'primary')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `disabled`: boolean (default: false)
- `fullWidth`: boolean (default: false)
- `type`: 'button' | 'submit' | 'reset' (default: 'button')
- `onclick`: function

---

### 3. **ProgressBar Component** (`/src/components/shared/ProgressBar.svelte`)

Display progress with linear or circular variants.

```svelte
<script>
  import ProgressBar from './components/shared/ProgressBar.svelte'
</script>

<!-- Linear Progress Bar -->
<ProgressBar
  value={2450}
  max={5000}
  variant="linear"
  showLabel={true}
  label="XP Progress"
/>

<!-- Circular Progress -->
<ProgressBar
  variant="circular"
  value={15}
  max={30}
>
  15/30
</ProgressBar>
```

**Props:**
- `value`: number (current value)
- `max`: number (maximum value, default: 100)
- `variant`: 'linear' | 'circular' (default: 'linear')
- `showLabel`: boolean (default: false)
- `label`: string (label text)

---

### 4. **Input Component** (`/src/components/shared/Input.svelte`)

Form inputs with labels and error states.

```svelte
<script>
  import Input from './components/shared/Input.svelte'

  let taskName = ''
  let error = ''
</script>

<Input
  type="text"
  bind:value={taskName}
  label="Task Name"
  placeholder="Enter task name"
  required={true}
  error={error}
  maxlength={100}
/>
```

**Props:**
- `type`: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
- `value`: string | number
- `placeholder`: string
- `disabled`: boolean
- `required`: boolean
- `label`: string
- `error`: string
- `maxlength`: number
- `id`: string (auto-generated if not provided)

---

### 5. **Checkbox Component** (`/src/components/shared/Checkbox.svelte`)

Custom styled checkbox with animation.

```svelte
<script>
  import Checkbox from './components/shared/Checkbox.svelte'

  let completed = false
</script>

<Checkbox
  bind:checked={completed}
  label="Complete this task"
  on:change={handleChange}
/>

<!-- Or with slot -->
<Checkbox bind:checked={completed}>
  <span class="font-bold">Important task</span>
</Checkbox>
```

**Props:**
- `checked`: boolean
- `disabled`: boolean
- `label`: string
- `id`: string (auto-generated if not provided)

---

### 6. **TaskCard Component** (`/src/components/shared/TaskCard.svelte`)

Complete task card with all states.

```svelte
<script>
  import TaskCard from './components/shared/TaskCard.svelte'

  let completed = false

  function handleToggle(newCompleted) {
    console.log('Task completed:', newCompleted)
  }
</script>

<TaskCard
  title="Complete workout"
  bind:completed
  category="Fitness"
  categoryIcon="🏋️"
  xpReward={50}
  description="30 minutes of exercise"
  onToggle={handleToggle}
  onClick={() => console.log('Card clicked')}
/>
```

**Props:**
- `title`: string (required)
- `completed`: boolean (default: false)
- `category`: string
- `categoryIcon`: string
- `xpReward`: number
- `description`: string
- `onToggle`: function(completed: boolean)
- `onClick`: function

---

### 7. **StreakDisplay Component** (`/src/components/shared/StreakDisplay.svelte`)

Beautiful streak display with fire animations.

```svelte
<script>
  import StreakDisplay from './components/shared/StreakDisplay.svelte'
</script>

<!-- Full Streak Display -->
<StreakDisplay
  currentStreak={15}
  bestStreak={30}
  variant="full"
  animated={true}
  showBest={true}
/>

<!-- Compact Streak Badge -->
<StreakDisplay
  currentStreak={15}
  variant="compact"
/>
```

**Props:**
- `currentStreak`: number (default: 0)
- `bestStreak`: number (default: 0)
- `variant`: 'compact' | 'full' (default: 'full')
- `animated`: boolean (default: true)
- `showBest`: boolean (default: true)

**Features:**
- 🔥 Fire emoji intensity based on streak (1 fire, 2 fires, 3 fires)
- ✨ Animated counter on mount
- 🎨 Dynamic color gradients (yellow → orange → red)
- 🌟 Fire particles for streaks ≥ 7 days
- 📊 Progress bar to legendary status (30 days)
- 💪 Motivational messages

---

### 8. **XPGainNotification Component** (`/src/components/shared/XPGainNotification.svelte`)

Floating XP gain animation.

```svelte
<script>
  import XPGainNotification from './components/shared/XPGainNotification.svelte'

  let showXP = false
  let xpPos = { x: 0, y: 0 }

  function onTaskComplete(event) {
    const rect = event.target.getBoundingClientRect()
    xpPos = { x: rect.left + rect.width / 2, y: rect.top }
    showXP = true
  }
</script>

{#if showXP}
  <XPGainNotification
    xpAmount={50}
    x={xpPos.x}
    y={xpPos.y}
    onComplete={() => showXP = false}
  />
{/if}
```

**Props:**
- `xpAmount`: number (required)
- `x`: number (screen X position)
- `y`: number (screen Y position)
- `onComplete`: function (called after animation)

---

### 9. **LevelUpCelebration Component** (`/src/components/shared/LevelUpCelebration.svelte`)

Full-screen level-up celebration with confetti.

```svelte
<script>
  import LevelUpCelebration from './components/shared/LevelUpCelebration.svelte'

  let showLevelUp = false
  let newLevel = 5

  function checkLevelUp(oldLevel, newLevel) {
    if (newLevel > oldLevel) {
      showLevelUp = true
    }
  }
</script>

{#if showLevelUp}
  <LevelUpCelebration
    newLevel={newLevel}
    onClose={() => showLevelUp = false}
  />
{/if}
```

**Props:**
- `newLevel`: number (required)
- `onClose`: function

**Features:**
- 🎉 Confetti burst animation
- ⚡ Screen flash effect
- 🎊 Badge scale pulse animation
- 🎨 Gradient text effects
- ⏱️ Auto-closes after 3 seconds

---

### 10. **PageTransition Component** (`/src/components/shared/PageTransition.svelte`)

Smooth page transitions.

```svelte
<script>
  import PageTransition from './components/shared/PageTransition.svelte'
</script>

<PageTransition type="slide" direction="right" duration={300}>
  <!-- Your page content -->
  <div class="page-content">
    <h1>Dashboard</h1>
    <!-- ... -->
  </div>
</PageTransition>
```

**Props:**
- `type`: 'slide' | 'fade' | 'scale' (default: 'slide')
- `direction`: 'left' | 'right' | 'up' | 'down' (default: 'right')
- `duration`: number (milliseconds, default: 300)
- `delay`: number (milliseconds, default: 0)

---

### 11. **ThemeParticles Component** (`/src/components/shared/ThemeParticles.svelte`)

Theme-specific visual effects.

```svelte
<script>
  import ThemeParticles from './components/shared/ThemeParticles.svelte'
  import { getStoredTheme } from '../lib/themes'

  let currentTheme = getStoredTheme()
</script>

<ThemeParticles theme={currentTheme} particleCount={10} />
```

**Props:**
- `theme`: Theme ('fire' | 'ocean' | 'forest' | 'cyberpunk')
- `particleCount`: number (default: 10)

**Effects by Theme:**
- 🔥 **Fire**: Rising ember particles
- 🌊 **Ocean**: Floating bubbles with wave animation
- 🌲 **Forest**: Falling leaves with rotation
- 💻 **Cyber**: Grid pattern + scan lines

---

### 12. **Toast Component** (`/src/components/shared/Toast.svelte`)

Notification toasts.

```svelte
<script>
  import Toast from './components/shared/Toast.svelte'

  let showToast = false

  function showSuccess() {
    showToast = true
  }
</script>

{#if showToast}
  <Toast
    variant="success"
    message="Task completed!"
    duration={3000}
    onClose={() => showToast = false}
  />
{/if}
```

**Props:**
- `variant`: 'success' | 'error' | 'info' | 'warning' (default: 'info')
- `message`: string (required)
- `duration`: number (milliseconds, 0 = manual close)
- `onClose`: function

---

## Integration Examples

### Example 1: Dashboard Stats with New Components

```svelte
<script>
  import Badge from './shared/Badge.svelte'
  import ProgressBar from './shared/ProgressBar.svelte'
  import StreakDisplay from './shared/StreakDisplay.svelte'

  export let userState
</script>

<!-- Level Display -->
<div class="flex items-center gap-16">
  <Badge variant="level" value={userState.level} animate={true} />
  <div>
    <h2 class="text-h3">Level {userState.level}</h2>
    <ProgressBar
      value={userState.xp}
      max={userState.xpForNextLevel}
      showLabel={true}
      label="XP Progress"
    />
  </div>
</div>

<!-- Streak Display -->
<StreakDisplay
  currentStreak={userState.currentStreak}
  bestStreak={userState.longestStreak}
  variant="full"
/>
```

### Example 2: Task List with TaskCard

```svelte
<script>
  import TaskCard from './shared/TaskCard.svelte'
  import XPGainNotification from './shared/XPGainNotification.svelte'
  import LevelUpCelebration from './shared/LevelUpCelebration.svelte'

  let tasks = [...]
  let showXP = false
  let xpAmount = 0
  let xpPos = { x: 0, y: 0 }
  let showLevelUp = false
  let newLevel = 0

  async function handleTaskToggle(task, completed) {
    if (completed) {
      // Show XP gain animation
      xpAmount = task.xpReward
      showXP = true

      // Check for level up
      const oldLevel = userState.level
      await completeTask(task.id, xpAmount)
      await addXP(xpAmount)

      // Reload state
      userState = await getUserState()

      if (userState.level > oldLevel) {
        newLevel = userState.level
        showLevelUp = true
      }
    }
  }
</script>

{#each tasks as task}
  <TaskCard
    title={task.name}
    bind:completed={task.completed}
    category={task.category}
    categoryIcon={task.icon}
    xpReward={task.xpReward}
    onToggle={(completed) => handleTaskToggle(task, completed)}
  />
{/each}

{#if showXP}
  <XPGainNotification
    xpAmount={xpAmount}
    x={xpPos.x}
    y={xpPos.y}
    onComplete={() => showXP = false}
  />
{/if}

{#if showLevelUp}
  <LevelUpCelebration
    newLevel={newLevel}
    onClose={() => showLevelUp = false}
  />
{/if}
```

### Example 3: Form with New Inputs

```svelte
<script>
  import Input from './shared/Input.svelte'
  import Button from './shared/Button.svelte'
  import Checkbox from './shared/Checkbox.svelte'

  let taskName = ''
  let isImportant = false
  let error = ''

  function handleSubmit() {
    if (!taskName) {
      error = 'Task name is required'
      return
    }
    // Submit task...
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  <Input
    type="text"
    bind:value={taskName}
    label="Task Name"
    placeholder="Enter task name"
    required={true}
    error={error}
  />

  <Checkbox
    bind:checked={isImportant}
    label="Mark as important"
  />

  <div class="flex gap-12">
    <Button variant="primary" type="submit" fullWidth={true}>
      Create Task
    </Button>
    <Button variant="ghost" onclick={handleCancel}>
      Cancel
    </Button>
  </div>
</form>
```

---

## CSS Classes Available

All design system classes from `app.css`:

### Elevation
- `.elevation-0` to `.elevation-5`
- `.glow-sm`, `.glow-md`, `.glow-lg`, `.glow-xl`

### Animations
- `.animate-fade-in-up`, `.animate-fade-in-scale`
- `.animate-slide-in-right`, `.animate-slide-in-left`
- `.animate-glow`, `.animate-glow-pulse`
- `.animate-shimmer`, `.animate-xp-shimmer`
- `.animate-bounce-in`, `.animate-heartbeat`
- `.animate-float-up`, `.animate-flame-flicker`
- `.animate-xp-float-up`, `.animate-level-up-flash`
- `.animate-badge-pulse`, `.animate-pulse-glow`
- `.animate-check-bounce`, `.animate-leaf-fall`
- `.animate-wave`, `.animate-ember-rise`
- `.animate-neon-pulse`, `.animate-scan-line`

### Transitions
- `.transition-smooth`, `.transition-bounce`
- `.transition-elastic`, `.transition-fast`, `.transition-slow`

### Interaction States
- `.interactive-lift`, `.interactive-scale`, `.interactive-glow`

### Component Classes
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`
- `.badge`, `.badge-xp`, `.badge-level`, `.badge-streak`
- `.progress-bar`, `.progress-bar-fill`
- `.input`, `.checkbox`
- `.task-card`, `.toast`

---

## Theme Integration

Use theme-aware CSS variables in your components:

```css
.my-component {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
}

.my-button {
  background: var(--color-accent);
  color: white;
}

.my-button:hover {
  background: var(--color-accent-hover);
}
```

Available theme variables:
- `--color-bg-primary`, `--color-bg-secondary`, `--color-bg-tertiary`
- `--color-text-primary`, `--color-text-secondary`, `--color-text-muted`
- `--color-accent`, `--color-accent-hover`
- `--color-border`
- `--color-gradient-start`, `--color-gradient-mid`, `--color-gradient-end`
- `--color-glow-color`, `--color-shimmer-color`

---

## Tailwind Utility Classes

Use the extended Tailwind classes:

```html
<!-- Typography -->
<h1 class="text-display">Display Text</h1>
<h2 class="text-h1">Heading 1</h2>
<p class="text-body">Body Text</p>
<span class="text-caption">Caption</span>

<!-- Spacing -->
<div class="p-16 gap-24 space-y-32">

<!-- Border Radius -->
<div class="rounded-lg">  <!-- 12px -->
<div class="rounded-xl">   <!-- 16px -->
<div class="rounded-2xl">  <!-- 24px -->

<!-- Shadows -->
<div class="shadow-elevation-1">
<div class="shadow-elevation-3">

<!-- Transitions -->
<button class="transition-smooth duration-normal ease-smooth">
```

---

## Next Steps

1. **Update Dashboard.svelte** - Replace existing stats with DashboardStats component
2. **Update Task Lists** - Replace task items with TaskCard component
3. **Update Forms** - Use Input and Button components
4. **Add Animations** - Integrate XPGainNotification and LevelUpCelebration
5. **Add Page Transitions** - Wrap pages with PageTransition component
6. **Add Theme Particles** - Include ThemeParticles in main layout

---

For questions or issues, check the component source files in `/src/components/shared/`.
