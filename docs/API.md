# Lifer API Documentation

**Version:** 1.0
**Last Updated:** 2025-11-16

## Overview

Lifer uses IndexedDB for local storage. While there's no REST API (it's a client-side PWA), you can integrate with Lifer data using JavaScript and the exported data formats.

---

## Data Access via JavaScript

Since Lifer runs entirely in the browser, you can access the IndexedDB database directly using the `idb-keyval` library.

### Installation

```bash
npm install idb-keyval
```

### Basic Usage

```typescript
import { get, set, keys, del } from 'idb-keyval'

// Get all tasks
const tasks = await get('tasks')

// Get user state
const userState = await get('userState')

// Update a task
const tasks = await get('tasks')
tasks.push({ id: 'new-task', title: 'My Task', ... })
await set('tasks', tasks)

// List all keys
const allKeys = await keys()
console.log(allKeys) // ['tasks', 'practices', 'outcomes', ...]
```

---

## Data Structure

### Database Keys

Lifer uses the following IndexedDB keys:

- `tasks` - Array of Task objects
- `practices` - Array of Practice objects
- `outcomes` - Array of Outcome objects
- `userState` - UserState object
- `history` - Array of HistoryRecord objects
- `settings` - AppSettings object
- `chores` - Array of Chore objects
- `focusSessions` - Array of FocusSession objects
- `energyLogs` - Array of EnergyLog objects
- `couplesSessions` - Array of CouplesSession objects
- `bodyDoubling` - BodyDoubling data
- `identities` - Array of Identity objects
- `morningRituals` - Array of MorningRitual objects
- `habitStacks` - Array of HabitStack objects
- `authenticityLogs` - Array of AuthenticityLog objects
- `marginalGains` - Array of MarginalGain objects
- `makerModeSessions` - Array of MakerModeSession objects
- `cookieJar` - Array of CookieJarVictory objects
- `seasons` - Array of Season objects

### Type Definitions

```typescript
interface Task {
  id: string
  title: string
  description?: string
  leverageScore: number
  completed: boolean
  createdAt: string
  completedAt?: string
  scheduledFor?: string
  outcomeId?: string
  isMorningTask?: boolean
  tags?: string[]
  fourLaws?: FourLaws
}

interface Practice {
  id: string
  name: string
  type: 'positive' | 'negative'
  target?: number
  unit?: string
  frequency?: string
  currentStreak?: number
  bestStreak?: number
  completionHistory?: Array<{ date: string; amount: number }>
  tags?: string[]
  gatewayVersion?: GatewayVersion
}

interface Outcome {
  id: string
  result: string
  purpose: string
  status: 'active' | 'in-progress' | 'completed' | 'archived'
  progress: number
  createdAt: string
  updatedAt?: string
}

interface UserState {
  level: number
  xp: number
  totalCompletions: number
  currentStreak: number
  bestStreak: number
  coins: number
  powerups: Record<string, number>
}

// See src/lib/types.ts for complete type definitions
```

---

## Export Formats

### 1. JSON Export

**Format:** Complete database backup
**Use Case:** Full backup and restore, data migration
**Import:** Compatible with Lifer's import feature

```javascript
import { exportAllData } from './lib/db/backup'

const jsonData = await exportAllData()
// Returns stringified JSON with all data
```

**Structure:**
```json
{
  "version": "1.0",
  "exportedAt": "2025-11-16T12:00:00.000Z",
  "data": {
    "tasks": [...],
    "practices": [...],
    "outcomes": [...],
    ...
  }
}
```

### 2. CSV Export (Tasks)

**Format:** Comma-separated values
**Use Case:** Excel, Google Sheets analysis
**Columns:** Title, Description, Leverage Score, Status, Created At, Completed At, Scheduled For, Outcome, Morning Task, Tags

```javascript
import { exportTasksToCSV } from './lib/db/export'

const csv = await exportTasksToCSV()
// Download or process CSV data
```

### 3. CSV Export (Practices)

**Format:** Comma-separated values
**Use Case:** Habit tracking analysis
**Columns:** Name, Type, Target, Unit, Frequency, Current Streak, Best Streak, Total Completions, Tags

```javascript
import { exportPracticesToCSV } from './lib/db/export'

const csv = await exportPracticesToCSV()
```

### 4. Markdown Export

**Format:** GitHub Flavored Markdown
**Use Case:** Notion databases, documentation
**Structure:** Hierarchical sections with tables

```javascript
import { exportToMarkdown } from './lib/db/export'

const markdown = await exportToMarkdown()
```

**Example Output:**
```markdown
# Lifer Data Export

**Exported:** 11/16/2025, 12:00:00 PM

---

## 📊 User Stats

- **Level:** 5
- **XP:** 1250
- **Current Streak:** 14 days

## ✅ Active Tasks (5)

### Complete project roadmap

- **Leverage Score:** 9/10
- **Due:** 11/20/2025
...
```

### 5. ICS Calendar Export

**Format:** iCalendar (RFC 5545)
**Use Case:** Google Calendar, Apple Calendar, Outlook
**Includes:** Tasks with due dates only

```javascript
import { exportToCalendar } from './lib/db/export'

const icsData = await exportToCalendar()
```

**Compatible with:**
- Google Calendar (import .ics file)
- Apple Calendar (double-click .ics file)
- Outlook (File > Import)
- Any RFC 5545 compatible calendar

---

## Integration Examples

### Notion Integration

1. Export data as Markdown
2. Create new Notion page
3. Import markdown file
4. Notion automatically creates database from tables

### Google Sheets Integration

1. Export tasks or practices as CSV
2. Open Google Sheets
3. File > Import > Upload CSV
4. Analyze with pivot tables, charts, etc.

### Calendar Integration

1. Export calendar (ICS format)
2. Open Google Calendar
3. Settings > Import & Export > Import
4. Select .ics file
5. Tasks appear as calendar events

### Custom Scripts

```javascript
// Read Lifer data from IndexedDB
import { get } from 'idb-keyval'

// Get all tasks
const tasks = await get('tasks')

// Filter high-leverage tasks
const highLeverage = tasks.filter(t => t.leverageScore >= 8)

// Calculate completion rate
const completedCount = tasks.filter(t => t.completed).length
const completionRate = (completedCount / tasks.length) * 100

// Send to external API
await fetch('https://api.example.com/tasks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ tasks: highLeverage })
})
```

### Zapier/Make.com Integration

Since Lifer is client-side only, you can:

1. Export data in desired format (JSON/CSV)
2. Upload to cloud storage (Google Drive, Dropbox)
3. Trigger Zapier/Make.com workflows from cloud storage

**Example Workflow:**
1. Export Lifer data to JSON
2. Upload to Google Drive
3. Zapier detects new file
4. Parses JSON and creates tasks in Todoist/Asana

---

## Security Considerations

1. **Local Storage Only:** All data stays in your browser (IndexedDB)
2. **No Cloud Sync:** No data sent to external servers
3. **Export Caution:** Exported files contain ALL your data
4. **Privacy:** Keep backups secure and encrypted

---

## Rate Limits

N/A - Lifer is entirely client-side with no API rate limits.

---

## Support

For issues or feature requests:
- GitHub: [github.com/myairhys/Lifer](https://github.com/myairhys/Lifer)
- Open an issue for API enhancement requests

---

## Changelog

### v1.0 (2025-11-16)
- Initial API documentation
- JSON, CSV, Markdown, ICS export formats
- IndexedDB direct access documentation
- Integration examples

---

## Future Enhancements

Potential future API features:
- WebSocket sync for real-time collaboration
- REST API for backend sync (optional)
- OAuth for third-party app integrations
- Webhooks for automation

---

## License

Lifer is open source. Check the repository for license details.
