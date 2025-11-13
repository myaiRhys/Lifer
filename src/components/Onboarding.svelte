<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()

  let currentStep = 0

  const steps = [
    {
      title: 'Welcome to Lifer',
      emoji: '🎯',
      content: `
        <p class="mb-4">Lifer is your command center for building a high-leverage life.</p>
        <p class="mb-4">Unlike traditional productivity apps that treat all tasks equally, Lifer helps you focus on what actually moves the needle.</p>
        <p><strong>The core principle:</strong> Not all work is created equal. A task rated 10/10 for leverage can be worth 10x more than busy work.</p>
      `
    },
    {
      title: 'How Leverage Works',
      emoji: '⚖️',
      content: `
        <p class="mb-4">Every task in Lifer gets a <strong>Leverage Score</strong> from 1-10:</p>
        <ul class="list-disc list-inside space-y-2 mb-4">
          <li><strong>1-3:</strong> Low-leverage (busy work, reactive tasks)</li>
          <li><strong>4-6:</strong> Medium-leverage (necessary but not game-changing)</li>
          <li><strong>7-10:</strong> High-leverage (compounds over time, moves your outcomes forward)</li>
        </ul>
        <p>Your <strong>Leverage Ratio</strong> tracks whether you're spending time on high-impact work or getting stuck in the weeds.</p>
      `
    },
    {
      title: 'Practices: Build Systems',
      emoji: '♻️',
      content: `
        <p class="mb-4">We've seeded 9 core health practices that compound over time:</p>
        <ul class="list-disc list-inside space-y-1 mb-4 text-sm">
          <li>Sleep (8 hours)</li>
          <li>Water Intake (2000ml)</li>
          <li>Protein (180g)</li>
          <li>Strength Training (3x/week)</li>
          <li>Cardio (30 min daily)</li>
          <li>Morning Sun (15 min)</li>
          <li>High-Leverage Work (2 hours)</li>
          <li>Morning Power Hour</li>
          <li>Daily Medications</li>
        </ul>
        <p>Each practice builds <strong>habit strength</strong> (0-100%) as you stay consistent.</p>
      `
    },
    {
      title: 'Outcomes: Know Your Why',
      emoji: '🎯',
      content: `
        <p class="mb-4">Before adding tasks, create <strong>Outcomes</strong> - the meaningful results you want to achieve.</p>
        <p class="mb-4">Every task should link to an outcome. This keeps you focused on results, not just completion.</p>
        <p class="mb-2"><strong>Example Outcome:</strong></p>
        <div class="bg-slate-700 p-3 rounded-lg text-sm">
          <div class="font-semibold mb-1">Result: Launch profitable SaaS product</div>
          <div class="text-slate-300">Purpose: Achieve financial freedom and help entrepreneurs build better products</div>
        </div>
      `
    },
    {
      title: 'Gamification & Growth',
      emoji: '⚡',
      content: `
        <p class="mb-4">Lifer rewards consistent effort:</p>
        <ul class="list-disc list-inside space-y-2 mb-4">
          <li><strong>XP & Levels:</strong> Earn experience for completing tasks (higher leverage = more XP)</li>
          <li><strong>Streaks:</strong> Track consecutive days of activity</li>
          <li><strong>Achievements:</strong> Unlock badges for milestones</li>
          <li><strong>Daily Challenges:</strong> Push yourself with targeted goals</li>
          <li><strong>Morning Multipliers:</strong> 2x XP for high-leverage tasks before 9 AM</li>
        </ul>
        <p>The gamification makes the grind more engaging, but the real reward is building the life you want.</p>
      `
    },
    {
      title: 'Ready to Start?',
      emoji: '🚀',
      content: `
        <p class="mb-4">You're all set! Here's how to get started:</p>
        <ol class="list-decimal list-inside space-y-2 mb-4">
          <li>Create your first <strong>Outcome</strong> (what do you want to achieve?)</li>
          <li>Add 2-3 high-leverage tasks linked to that outcome</li>
          <li>Log your first practice (start with water or sleep)</li>
          <li>Complete a task before 9 AM to earn the morning multiplier</li>
        </ol>
        <p class="font-semibold">Remember: Focus on leverage, not volume. One 10/10 task beats ten 1/10 tasks.</p>
      `
    }
  ]

  function nextStep() {
    if (currentStep < steps.length - 1) {
      currentStep++
    } else {
      completeOnboarding()
    }
  }

  function prevStep() {
    if (currentStep > 0) {
      currentStep--
    }
  }

  function skipOnboarding() {
    if (confirm('Skip the tour? You can always revisit these concepts in the app.')) {
      completeOnboarding()
    }
  }

  function completeOnboarding() {
    dispatch('complete')
  }

  $: isLastStep = currentStep === steps.length - 1
  $: currentStepData = steps[currentStep]
</script>

<div class="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
  <div class="bg-slate-800 border-2 border-blue-500 rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
    <!-- Progress indicator -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex gap-2">
        {#each steps as _, i}
          <div
            class="h-2 rounded-full transition-all {i === currentStep ? 'w-8 bg-blue-500' : i < currentStep ? 'w-2 bg-green-500' : 'w-2 bg-slate-600'}"
          />
        {/each}
      </div>
      <button
        class="text-sm text-slate-400 hover:text-slate-300 transition-colors"
        on:click={skipOnboarding}
      >
        Skip Tour
      </button>
    </div>

    <!-- Step content -->
    <div class="text-center mb-6">
      <div class="text-6xl mb-4">{currentStepData.emoji}</div>
      <h2 class="text-3xl font-bold mb-4">{currentStepData.title}</h2>
      <div class="text-left text-slate-200 leading-relaxed">
        {@html currentStepData.content}
      </div>
    </div>

    <!-- Navigation -->
    <div class="flex gap-3">
      {#if currentStep > 0}
        <button
          class="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
          on:click={prevStep}
        >
          ← Back
        </button>
      {/if}
      <button
        class="flex-1 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
        on:click={nextStep}
      >
        {isLastStep ? 'Start Using Lifer 🚀' : 'Next →'}
      </button>
    </div>

    <!-- Step counter -->
    <div class="text-center mt-4 text-sm text-slate-400">
      Step {currentStep + 1} of {steps.length}
    </div>
  </div>
</div>
