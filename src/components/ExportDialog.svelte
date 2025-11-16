<!--
@component
Export Dialog Component
Provides multiple export formats for external integrations

Formats:
- JSON: Complete backup (existing)
- CSV: Tasks and Practices (Excel/Sheets)
- Markdown: Notion-compatible export
- ICS Calendar: Google/Apple Calendar integration
-->
<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { exportHandlers } from '../lib/db/export'

  export let show = false

  const dispatch = createEventDispatcher()

  let exporting = false
  let selectedFormat: string | null = null

  const exportFormats = [
    {
      id: 'json',
      name: 'JSON (Complete Backup)',
      icon: '📦',
      description: 'Full database backup with all data',
      color: 'from-blue-600 to-cyan-600',
      handler: exportHandlers.json
    },
    {
      id: 'csv-tasks',
      name: 'CSV (Tasks)',
      icon: '📊',
      description: 'Tasks in spreadsheet format (Excel, Google Sheets)',
      color: 'from-green-600 to-emerald-600',
      handler: exportHandlers.csv
    },
    {
      id: 'csv-practices',
      name: 'CSV (Practices)',
      icon: '♻️',
      description: 'Daily practices with streak data',
      color: 'from-purple-600 to-pink-600',
      handler: exportHandlers.csvPractices
    },
    {
      id: 'markdown',
      name: 'Markdown (Notion)',
      icon: '📝',
      description: 'Notion-compatible markdown export',
      color: 'from-orange-600 to-red-600',
      handler: exportHandlers.markdown
    },
    {
      id: 'calendar',
      name: 'ICS Calendar',
      icon: '📅',
      description: 'Tasks with due dates (Google/Apple Calendar)',
      color: 'from-indigo-600 to-blue-600',
      handler: exportHandlers.calendar
    }
  ]

  async function handleExport(format: typeof exportFormats[0]) {
    exporting = true
    selectedFormat = format.id

    try {
      await format.handler()
      // Success - close dialog after short delay
      setTimeout(() => {
        close()
      }, 1000)
    } catch (error) {
      console.error('Export failed:', error)
      alert(`Export failed: ${error.message}`)
    } finally {
      exporting = false
      selectedFormat = null
    }
  }

  function close() {
    show = false
    dispatch('close')
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      close()
    }
  }
</script>

{#if show}
  <div
    class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
    on:click={close}
    on:keydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    aria-labelledby="export-title"
  >
    <div
      class="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-2xl border-2 border-slate-700/50 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      on:click|stopPropagation
      role="document"
    >
      <!-- Header -->
      <div class="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700 px-6 py-5 rounded-t-2xl">
        <div class="flex items-start justify-between">
          <div>
            <h2 id="export-title" class="text-2xl md:text-3xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Export Data
            </h2>
            <p class="text-sm text-slate-400 mt-1">
              Choose a format for external integrations
            </p>
          </div>

          <button
            on:click={close}
            class="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-lg"
            aria-label="Close dialog"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Export Formats Grid -->
      <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {#each exportFormats as format}
          <button
            on:click={() => handleExport(format)}
            disabled={exporting}
            class="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 hover:from-slate-700/50 hover:to-slate-800/50 rounded-xl p-6 border-2 border-slate-700/50 hover:border-slate-600 transition-all duration-300 hover:scale-102 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed text-left"
            aria-label={`Export as ${format.name}`}
          >
            <!-- Glow Effect on Hover -->
            <div class="absolute -inset-1 bg-gradient-to-r {format.color} rounded-xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity -z-10"></div>

            <!-- Loading Overlay -->
            {#if exporting && selectedFormat === format.id}
              <div class="absolute inset-0 bg-slate-900/90 rounded-xl flex items-center justify-center">
                <div class="flex flex-col items-center gap-3">
                  <div class="flex gap-2">
                    <div class="w-3 h-3 bg-white rounded-full animate-bounce"></div>
                    <div class="w-3 h-3 bg-white rounded-full animate-bounce animation-delay-100"></div>
                    <div class="w-3 h-3 bg-white rounded-full animate-bounce animation-delay-200"></div>
                  </div>
                  <p class="text-sm text-white font-medium">Exporting...</p>
                </div>
              </div>
            {/if}

            <!-- Icon -->
            <div class="text-5xl mb-3" aria-hidden="true">{format.icon}</div>

            <!-- Title -->
            <h3 class="text-lg font-bold text-white mb-2 group-hover:bg-gradient-to-r group-hover:{format.color} group-hover:bg-clip-text group-hover:text-transparent transition-all">
              {format.name}
            </h3>

            <!-- Description -->
            <p class="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
              {format.description}
            </p>

            <!-- Export Indicator -->
            <div class="mt-4 flex items-center gap-2 text-xs text-slate-500 group-hover:text-slate-400 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              <span>Click to export</span>
            </div>
          </button>
        {/each}
      </div>

      <!-- Footer Info -->
      <div class="px-6 py-4 bg-slate-900/50 border-t border-slate-700 rounded-b-2xl">
        <div class="flex items-start gap-3 text-sm text-slate-400">
          <div class="text-xl" aria-hidden="true">💡</div>
          <div>
            <p class="font-medium text-slate-300 mb-1">Export Tips:</p>
            <ul class="space-y-1 text-xs">
              <li>• <strong>JSON:</strong> Use for full backups and restoring data</li>
              <li>• <strong>CSV:</strong> Open in Excel or Google Sheets for analysis</li>
              <li>• <strong>Markdown:</strong> Import directly into Notion databases</li>
              <li>• <strong>Calendar:</strong> Import .ics file into any calendar app</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .animate-fade-in {
    animation: fade-in 0.2s ease-out;
  }

  .animation-delay-100 {
    animation-delay: 100ms;
  }

  .animation-delay-200 {
    animation-delay: 200ms;
  }

  .hover\:scale-102:hover {
    transform: scale(1.02);
  }

  .active\:scale-98:active {
    transform: scale(0.98);
  }
</style>
