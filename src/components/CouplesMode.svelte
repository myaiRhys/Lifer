<script lang="ts">
  import { onMount } from 'svelte'
  import {
    getCouplesProfile,
    createCouplesProfile,
    getMorningSyncs,
    getTodaysMorningSync,
    createMorningSync,
    getCoupleRewards,
    createCoupleReward,
    unlockCoupleReward,
    redeemCoupleReward,
    deleteCoupleReward
  } from '../lib/db'
  import type { CouplesProfile, MorningSync, CoupleReward } from '../lib/types'

  let activeTab: 'setup' | 'sync' | 'rewards' = 'setup'
  let couplesProfile: CouplesProfile | null = null
  let todaysSync: MorningSync | null = null
  let rewards: CoupleReward[] = []

  // Setup state
  let myCode = ''
  let partnerCode = ''
  let myName = ''
  let partnerName = ''

  // Morning sync state
  let syncStep = 1
  let myPriorities: [string, string, string] = ['', '', '']
  let myEnergy = 5
  let partnerPriorities: [string, string, string] = ['', '', ''] // Simulated
  let partnerEnergy = 7 // Simulated

  // Rewards state
  let showCreateReward = false
  let newReward = {
    name: '',
    description: '',
    category: 'quality_time' as CoupleReward['category'],
    xpCost: 500,
    condition: '',
    isPrivate: false
  }

  onMount(async () => {
    await loadData()
    generateMyCode()
  })

  async function loadData() {
    couplesProfile = await getCouplesProfile()
    todaysSync = await getTodaysMorningSync()
    rewards = await getCoupleRewards()

    // Set active tab based on state
    if (!couplesProfile) {
      activeTab = 'setup'
    } else if (!todaysSync) {
      activeTab = 'sync'
    } else {
      activeTab = 'rewards'
    }
  }

  function generateMyCode() {
    myCode = Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  async function handleConnect() {
    if (!myName.trim() || !partnerName.trim() || partnerCode.length !== 6) {
      alert('Please fill in all fields')
      return
    }

    const profile = await createCouplesProfile(
      'user1',
      'user2',
      myName.trim(),
      partnerName.trim()
    )

    couplesProfile = profile
    alert(`🎉 You're paired with ${partnerName}! Start your first morning sync.`)
    activeTab = 'sync'
  }

  async function handleSubmitSync() {
    if (!couplesProfile) return

    // Simulate partner's data for demo
    partnerPriorities = ['Complete project proposal', 'Team meeting', 'Code review']
    partnerEnergy = 7

    const sync = await createMorningSync(
      myPriorities,
      partnerPriorities,
      myEnergy,
      partnerEnergy,
      false
    )

    todaysSync = sync
    alert(`✅ Morning sync complete! +50 Couple XP\n\nCouples Streak: ${couplesProfile.couplesStreak + 1} days`)
    await loadData()
  }

  async function handleCreateReward() {
    if (!newReward.name.trim() || !newReward.description.trim()) {
      alert('Please fill in name and description')
      return
    }

    await createCoupleReward(
      newReward.name,
      newReward.description,
      newReward.category,
      newReward.xpCost,
      newReward.condition || 'Unlocked when couple has enough XP',
      newReward.isPrivate,
      'user1'
    )

    showCreateReward = false
    newReward = {
      name: '',
      description: '',
      category: 'quality_time',
      xpCost: 500,
      condition: '',
      isPrivate: false
    }

    await loadData()
  }

  async function handleUnlockReward(rewardId: string) {
    const reward = await unlockCoupleReward(rewardId)
    if (reward) {
      alert(`🎉 Reward unlocked: ${reward.name}`)
      await loadData()
    } else {
      alert('Not enough Couple XP to unlock this reward')
    }
  }

  async function handleRedeemReward(rewardId: string) {
    if (confirm('Redeem this reward now?')) {
      await redeemCoupleReward(rewardId)
      alert('✨ Reward redeemed! Enjoy!')
      await loadData()
    }
  }

  async function handleDeleteReward(rewardId: string) {
    if (confirm('Delete this reward?')) {
      await deleteCoupleReward(rewardId)
      await loadData()
    }
  }

  function getCategoryEmoji(category: CoupleReward['category']): string {
    const map = {
      quality_time: '🎬',
      intimate: '💕',
      practical: '🏠',
      big_goal: '✈️'
    }
    return map[category]
  }

  function getEnergyEmoji(energy: number): string {
    if (energy >= 8) return '⚡'
    if (energy >= 6) return '😊'
    if (energy >= 4) return '😐'
    return '😴'
  }

  function getInsight(): string {
    if (!todaysSync) return ''

    const myHigh = myEnergy >= 7
    const partnerHigh = partnerEnergy >= 7

    if (myHigh && partnerHigh) {
      return '🔥 Both high energy! Perfect day for tackling big goals together.'
    } else if (myHigh && !partnerHigh) {
      return '💡 You\'re high energy, partner is moderate. You tackle big tasks, partner handles lighter work?'
    } else if (!myHigh && partnerHigh) {
      return '💡 Partner has high energy today. Let them lead on challenging tasks!'
    } else {
      return '🌱 Both moderate energy. Take it easy, focus on simple wins.'
    }
  }
</script>

<div class="max-w-4xl mx-auto">
  <h2 class="text-3xl font-bold mb-6">💑 Pair Lifers</h2>

  <!-- Tabs -->
  <div class="flex gap-2 mb-6 border-b border-slate-700">
    <button
      on:click={() => activeTab = 'setup'}
      class="px-4 py-2 font-medium transition-colors {activeTab === 'setup' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-slate-300'}"
    >
      {couplesProfile ? '👥 Profile' : '🔗 Connect'}
    </button>
    <button
      on:click={() => activeTab = 'sync'}
      class="px-4 py-2 font-medium transition-colors {activeTab === 'sync' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-slate-300'}"
      disabled={!couplesProfile}
    >
      ☀️ Morning Sync
      {#if todaysSync}
        <span class="ml-1 text-green-400">✓</span>
      {/if}
    </button>
    <button
      on:click={() => activeTab = 'rewards'}
      class="px-4 py-2 font-medium transition-colors {activeTab === 'rewards' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-slate-300'}"
      disabled={!couplesProfile}
    >
      🎁 Rewards
    </button>
  </div>

  <!-- Setup/Profile Tab -->
  {#if activeTab === 'setup'}
    <div class="bg-slate-800 border border-slate-700 rounded-lg p-6">
      {#if !couplesProfile}
        <!-- Connection Setup -->
        <h3 class="text-2xl font-bold mb-6">Connect with Your Partner</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <!-- Your Info -->
          <div>
            <label class="block text-sm font-medium mb-2">Your Name</label>
            <input
              type="text"
              bind:value={myName}
              placeholder="Your name"
              class="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <!-- Partner Info -->
          <div>
            <label class="block text-sm font-medium mb-2">Partner's Name</label>
            <input
              type="text"
              bind:value={partnerName}
              placeholder="Partner's name"
              class="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium mb-2">Your invite code:</label>
          <div class="bg-slate-700 p-4 rounded-lg text-center mb-2">
            <div class="text-4xl font-bold tracking-widest font-mono text-blue-400">{myCode}</div>
          </div>
          <button
            on:click={() => navigator.clipboard.writeText(`Join me on Lifer! Code: ${myCode}`)}
            class="w-full bg-slate-700 hover:bg-slate-600 p-2 rounded-lg transition-colors text-sm"
          >
            📋 Copy Invite Link
          </button>
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium mb-2">Enter partner's code:</label>
          <input
            type="text"
            bind:value={partnerCode}
            placeholder="ABC123"
            maxlength="6"
            class="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-center text-3xl tracking-widest font-mono focus:outline-none focus:border-blue-500 uppercase"
          />
        </div>

        <button
          on:click={handleConnect}
          disabled={!myName || !partnerName || partnerCode.length !== 6}
          class="w-full bg-blue-600 hover:bg-blue-500 p-4 rounded-lg font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Connect as Pair Lifers
        </button>
      {:else}
        <!-- Couples Profile -->
        <div class="text-center mb-6">
          <div class="text-6xl mb-4">💑</div>
          <h3 class="text-2xl font-bold mb-2">{couplesProfile.partner1Name} & {couplesProfile.partner2Name}</h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="bg-slate-700 rounded-lg p-4 text-center">
            <div class="text-sm text-slate-400 mb-1">Relationship Level</div>
            <div class="text-3xl font-bold text-purple-400">{couplesProfile.relationshipLevel}</div>
          </div>
          <div class="bg-slate-700 rounded-lg p-4 text-center">
            <div class="text-sm text-slate-400 mb-1">Shared XP</div>
            <div class="text-3xl font-bold text-yellow-400">{couplesProfile.sharedXP}</div>
          </div>
          <div class="bg-slate-700 rounded-lg p-4 text-center">
            <div class="text-sm text-slate-400 mb-1">Couples Streak</div>
            <div class="text-3xl font-bold text-green-400">{couplesProfile.couplesStreak} days</div>
          </div>
        </div>

        <div class="bg-blue-900/30 border border-blue-500 rounded-lg p-4">
          <p class="text-sm">
            💡 Complete daily morning syncs to build your streak and earn Couple XP to unlock rewards!
          </p>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Morning Sync Tab -->
  {#if activeTab === 'sync'}
    <div class="bg-slate-800 border border-slate-700 rounded-lg p-6">
      {#if todaysSync}
        <!-- Already completed today -->
        <div class="text-center py-8">
          <div class="text-6xl mb-4">✅</div>
          <h3 class="text-2xl font-bold mb-4">Today's Sync Complete!</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <!-- Your Side -->
            <div class="bg-slate-700 rounded-lg p-4">
              <h4 class="font-bold mb-3 flex items-center justify-between">
                <span>{couplesProfile?.partner1Name}'s Day</span>
                <span class="text-2xl">{getEnergyEmoji(todaysSync.partner1Energy)}</span>
              </h4>
              <ol class="text-sm space-y-2">
                {#each todaysSync.partner1Priorities as priority, i}
                  <li class="flex items-start gap-2">
                    <span class="text-blue-400">{i + 1}.</span>
                    <span>{priority}</span>
                  </li>
                {/each}
              </ol>
              <div class="mt-3 text-xs text-slate-400">Energy: {todaysSync.partner1Energy}/10</div>
            </div>

            <!-- Partner's Side -->
            <div class="bg-slate-700 rounded-lg p-4">
              <h4 class="font-bold mb-3 flex items-center justify-between">
                <span>{couplesProfile?.partner2Name}'s Day</span>
                <span class="text-2xl">{getEnergyEmoji(todaysSync.partner2Energy)}</span>
              </h4>
              <ol class="text-sm space-y-2">
                {#each todaysSync.partner2Priorities as priority, i}
                  <li class="flex items-start gap-2">
                    <span class="text-blue-400">{i + 1}.</span>
                    <span>{priority}</span>
                  </li>
                {/each}
              </ol>
              <div class="mt-3 text-xs text-slate-400">Energy: {todaysSync.partner2Energy}/10</div>
            </div>
          </div>

          <div class="bg-green-900/30 border border-green-500 rounded-lg p-4">
            <p class="font-semibold mb-2">{getInsight()}</p>
          </div>
        </div>
      {:else}
        <!-- Morning Sync Flow -->
        <h3 class="text-2xl font-bold mb-6">☀️ Morning Sync</h3>

        {#if syncStep === 1}
          <!-- Step 1: Priorities -->
          <div class="mb-6">
            <p class="mb-4">What are your top 3 priorities today?</p>
            {#each [0, 1, 2] as i}
              <input
                type="text"
                placeholder="Priority {i + 1}"
                bind:value={myPriorities[i]}
                class="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg mb-3 focus:outline-none focus:border-blue-500"
              />
            {/each}
          </div>
          <button
            on:click={() => syncStep = 2}
            disabled={!myPriorities[0] || !myPriorities[1] || !myPriorities[2]}
            class="w-full bg-blue-600 hover:bg-blue-500 p-3 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Continue
          </button>
        {/if}

        {#if syncStep === 2}
          <!-- Step 2: Energy -->
          <div class="mb-6">
            <p class="mb-4">How's your energy today?</p>
            <div class="text-6xl text-center mb-4">{getEnergyEmoji(myEnergy)}</div>
            <input
              type="range"
              min="1"
              max="10"
              bind:value={myEnergy}
              class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 mb-2"
            />
            <div class="text-center text-2xl font-bold text-blue-400">{myEnergy}/10</div>
          </div>
          <div class="flex gap-3">
            <button
              on:click={() => syncStep = 1}
              class="flex-1 bg-slate-700 hover:bg-slate-600 p-3 rounded-lg font-medium transition-colors"
            >
              Back
            </button>
            <button
              on:click={() => syncStep = 3}
              class="flex-1 bg-blue-600 hover:bg-blue-500 p-3 rounded-lg font-medium transition-colors"
            >
              Continue
            </button>
          </div>
        {/if}

        {#if syncStep === 3}
          <!-- Step 3: Summary -->
          <div class="mb-6">
            <h4 class="font-bold mb-4">Review & Complete</h4>

            <div class="bg-slate-700 rounded-lg p-4 mb-4">
              <h5 class="font-semibold mb-2">Your Priorities:</h5>
              <ol class="text-sm space-y-1">
                {#each myPriorities as priority, i}
                  <li>{i + 1}. {priority}</li>
                {/each}
              </ol>
              <div class="mt-2 text-sm text-slate-400">Energy: {myEnergy}/10 {getEnergyEmoji(myEnergy)}</div>
            </div>

            <div class="bg-blue-900/30 border border-blue-500 rounded-lg p-4 mb-4">
              <p class="text-sm">
                💡 Your partner will see your priorities and energy level. This helps you coordinate and support each other throughout the day!
              </p>
            </div>
          </div>

          <div class="flex gap-3">
            <button
              on:click={() => syncStep = 2}
              class="flex-1 bg-slate-700 hover:bg-slate-600 p-3 rounded-lg font-medium transition-colors"
            >
              Back
            </button>
            <button
              on:click={handleSubmitSync}
              class="flex-1 bg-green-600 hover:bg-green-500 p-3 rounded-lg font-medium transition-colors"
            >
              Complete Sync (+50 XP)
            </button>
          </div>
        {/if}
      {/if}
    </div>
  {/if}

  <!-- Rewards Tab -->
  {#if activeTab === 'rewards'}
    <div class="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-2xl font-bold">Couple Rewards</h3>
        <button
          on:click={() => showCreateReward = !showCreateReward}
          class="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + Add Reward
        </button>
      </div>

      {#if couplesProfile}
        <div class="mb-6 bg-slate-700 rounded-lg p-4 text-center">
          <div class="text-sm text-slate-400 mb-1">Available Couple XP</div>
          <div class="text-3xl font-bold text-yellow-400">{couplesProfile.sharedXP}</div>
        </div>
      {/if}

      {#if showCreateReward}
        <!-- Create Reward Form -->
        <div class="bg-slate-700 border border-slate-600 rounded-lg p-4 mb-6">
          <h4 class="font-semibold mb-4">Create New Reward</h4>

          <input
            type="text"
            placeholder="Reward name"
            bind:value={newReward.name}
            class="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg mb-3 focus:outline-none focus:border-blue-500"
          />

          <textarea
            placeholder="Description"
            bind:value={newReward.description}
            rows="3"
            class="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg mb-3 focus:outline-none focus:border-blue-500"
          />

          <select
            bind:value={newReward.category}
            class="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg mb-3 focus:outline-none focus:border-blue-500"
          >
            <option value="quality_time">🎬 Quality Time</option>
            <option value="intimate">💕 Intimate</option>
            <option value="practical">🏠 Practical</option>
            <option value="big_goal">✈️ Big Goal</option>
          </select>

          <div class="mb-3">
            <label class="block text-sm mb-2">XP Cost: {newReward.xpCost}</label>
            <input
              type="range"
              min="100"
              max="2000"
              step="50"
              bind:value={newReward.xpCost}
              class="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <label class="flex items-center gap-2 mb-4 cursor-pointer">
            <input
              type="checkbox"
              bind:checked={newReward.isPrivate}
              class="w-4 h-4"
            />
            <span class="text-sm">Make private (only you see details)</span>
          </label>

          <div class="flex gap-2">
            <button
              on:click={() => showCreateReward = false}
              class="flex-1 bg-slate-800 hover:bg-slate-700 p-3 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              on:click={handleCreateReward}
              class="flex-1 bg-blue-600 hover:bg-blue-500 p-3 rounded-lg font-medium transition-colors"
            >
              Create
            </button>
          </div>
        </div>
      {/if}

      <!-- Rewards List -->
      <div class="space-y-3">
        {#each rewards as reward}
          <div class="bg-slate-700 border border-slate-600 rounded-lg p-4">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-2xl">{getCategoryEmoji(reward.category)}</span>
                  <h4 class="font-bold">
                    {reward.isPrivate ? '🔒 Private Reward' : reward.name}
                  </h4>
                </div>
                {#if !reward.isPrivate}
                  <p class="text-sm text-slate-300 mb-2">{reward.description}</p>
                {/if}
                <div class="flex items-center gap-3 text-sm">
                  <span class="text-yellow-400 font-semibold">{reward.xpCost} XP</span>
                  {#if reward.unlocked}
                    <span class="text-green-400">✓ Unlocked</span>
                  {/if}
                  {#if reward.redeemedAt}
                    <span class="text-purple-400">✨ Redeemed</span>
                  {/if}
                </div>
              </div>

              <div class="flex flex-col gap-2">
                {#if !reward.unlocked && couplesProfile}
                  <button
                    on:click={() => handleUnlockReward(reward.id)}
                    disabled={couplesProfile.sharedXP < reward.xpCost}
                    class="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Unlock
                  </button>
                {/if}
                {#if reward.unlocked && !reward.redeemedAt}
                  <button
                    on:click={() => handleRedeemReward(reward.id)}
                    class="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition-colors"
                  >
                    Redeem
                  </button>
                {/if}
                <button
                  on:click={() => handleDeleteReward(reward.id)}
                  class="px-4 py-2 bg-red-900/50 hover:bg-red-900/70 rounded-lg text-sm font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        {/each}

        {#if rewards.length === 0}
          <div class="text-center py-12 text-slate-500">
            <p class="mb-2">No rewards yet!</p>
            <p class="text-sm">Create couple rewards to work towards together.</p>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>
