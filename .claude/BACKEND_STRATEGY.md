# LIFER BACKEND STRATEGY
## Offline-First Architecture & Multi-User Features

**Last Updated:** 2025-11-14
**Current Architecture:** 100% Client-Side, Offline-First
**Future Architecture:** Hybrid (Client-First with Optional Sync)

---

## CORE PHILOSOPHY: OFFLINE-FIRST

### Why Offline-First?

**Privacy:** No data leaves your device unless you explicitly export it.
**Performance:** Instant response times (no network latency).
**Reliability:** Works on planes, in basements, during internet outages.
**Simplicity:** No backend to manage, no servers to pay for, no scaling issues.
**Ownership:** Your data lives on your device, not in someone else's cloud.

**This is non-negotiable for Lifer v1.0 and v2.0.**

---

## CURRENT ARCHITECTURE

### Data Storage: IndexedDB

```
User's Browser
└── IndexedDB (via idb-keyval)
    ├── userState
    ├── tasks
    ├── practices
    ├── outcomes
    ├── energyLogs
    ├── couplesProfile (simulated)
    ├── bodyDoublingSessions (simulated)
    └── ... (21 total collections)
```

**Characteristics:**
- **Persistent:** Data survives browser restarts, months of inactivity
- **Large capacity:** Typically 50MB+ (way more than needed)
- **Fast:** Sub-millisecond reads/writes
- **Indexed:** Efficient queries on common fields

### Deployment: GitHub Pages

```
GitHub Repository
└── gh-pages branch (static files)
    ├── index.html
    ├── assets/
    │   ├── app.js (Svelte compiled)
    │   ├── app.css (Tailwind)
    │   └── ...
    └── vite.config.ts (base: '/Lifer/')
```

**Characteristics:**
- **Free:** GitHub Pages = $0/month
- **CDN:** Fast global delivery
- **HTTPS:** Secure by default
- **No backend:** Just static files

### Build Process

```bash
npm run build   # Vite builds to dist/
npm run deploy  # Pushes dist/ to gh-pages branch
```

**Result:** https://[username].github.io/Lifer/

---

## HOW MULTI-USER FEATURES WORK (CURRENT)

### Couples Mode: Simulated

**Current Implementation:**
```typescript
// CouplesMode.svelte
async function connectPartner() {
  // No actual connection to another user
  // Creates local simulation data
  const couplesProfile = {
    id: Date.now().toString(),
    partner1Id: 'user1', // Always you
    partner2Id: 'user2', // Simulated partner
    partner1Name: 'You',
    partner2Name: 'Partner', // User can edit
    // ... rest is stored locally
  }
  await set('couplesProfile', couplesProfile)
}
```

**What Actually Happens:**
1. User enters partner code (ignored, just for UX)
2. Local profile created with two "users"
3. Morning sync: User fills out both partner's data manually
4. Shared XP/outcomes: Just UI labels, all stored locally

**Limitations:**
- No real-time sync between devices
- Partner doesn't actually see anything
- It's a **single-player simulation** of a two-player feature

**Why This Is OK:**
- UX is identical to what real version would be
- User can visualize couples workflow
- Framework is in place for future real implementation
- Still useful: morning ritual structure, accountability prompts

### Body Doubling: Simulated

**Current Implementation:**
Similar to couples mode. User creates a session, "invites" a friend (simulated), and tracks their own focus.

**Limitations:**
- No actual connection to another device
- Friend doesn't get invite
- Single-player simulation

---

## BACKUP & RESTORE: THE CURRENT "SYNC" SOLUTION

### Export All Data

**Feature:** `backup.ts` module
```typescript
async function exportAllData() {
  // Read all 21 collections from IndexedDB
  const data = {
    userState: await get(KEYS.USER_STATE),
    tasks: await get(KEYS.TASKS),
    practices: await get(KEYS.PRACTICES),
    // ... all 21 collections
    exportedAt: new Date().toISOString(),
    version: '1.0'
  }
  return JSON.stringify(data, null, 2)
}
```

**User Flow:**
1. Settings → Export All Data
2. Downloads `lifer-backup-2025-11-14.json`
3. User manually saves to Google Drive, Dropbox, etc.

### Import Data

**Feature:** `backup.ts` module
```typescript
async function importAllData(jsonString: string) {
  const data = JSON.parse(jsonString)
  // Write all collections back to IndexedDB
  await set(KEYS.USER_STATE, data.userState)
  await set(KEYS.TASKS, data.tasks)
  // ... all 21 collections
  return true
}
```

**User Flow:**
1. Settings → Import Data
2. Selects JSON file
3. Confirms (replaces all current data)
4. Page reloads with restored data

**Use Cases:**
- **Backup:** Weekly export to cloud storage
- **Sync Between Devices:** Export on laptop, import on phone
- **Recovery:** Lost data? Import last backup

**Limitations:**
- Manual process (not automatic)
- Overwrites all data (no merge)
- No conflict resolution

---

## FUTURE BACKEND OPTIONS (NOT IMPLEMENTED)

### Option 1: Serverless Sync (Recommended)

**Tech Stack:**
- **Frontend:** Svelte (unchanged)
- **Storage:** IndexedDB (unchanged, primary)
- **Sync:** Firebase Firestore or Supabase
- **Auth:** Firebase Auth or Supabase Auth

**Architecture:**
```
User's Browser
├── IndexedDB (primary, offline-capable)
└── Sync Service (background)
    └── Firestore/Supabase (cloud backup)
```

**How It Works:**
1. User always writes to IndexedDB first (instant)
2. Sync service watches for changes
3. When online, pushes changes to cloud
4. When online, pulls changes from cloud
5. Conflict resolution: last-write-wins or manual

**Couples Mode (Real):**
```
User A's Device                User B's Device
├── IndexedDB                  ├── IndexedDB
└── Firestore                  └── Firestore
    └── couples/{coupleId}         └── couples/{coupleId}
        ├── morningSync            ├── morningSync
        ├── sharedOutcomes         ├── sharedOutcomes
        └── realtime listener      └── realtime listener
```

**Benefits:**
- Still offline-first (IndexedDB is source of truth)
- Auto-sync when online
- Real-time collaboration (couples, body doubling)
- Free tier: Firebase (Spark), Supabase (Free) = $0/month for most users
- Scales to millions of users

**Cost:**
- **Free tier:** 50K reads/day, 20K writes/day (Firestore)
- **Paid tier:** ~$0.06 per 100K reads (only if exceeded)
- **Typical user:** <$0.50/month even with heavy usage

**Implementation Effort:**
- **Phase 1:** Auth + basic sync: 1-2 weeks
- **Phase 2:** Real-time couples mode: 1-2 weeks
- **Phase 3:** Conflict resolution: 1 week

**Recommended For:**
- Real couples mode
- Body doubling
- Cross-device sync
- Backup automation

### Option 2: Peer-to-Peer Sync (Experimental)

**Tech Stack:**
- **WebRTC:** Direct browser-to-browser connection
- **PeerJS:** Simplified WebRTC library
- **Signaling:** Minimal server for initial connection

**Architecture:**
```
User A's Browser <--- WebRTC ---> User B's Browser
       ↓                                  ↓
   IndexedDB                          IndexedDB
```

**How It Works:**
1. Users exchange invite codes (contains connection info)
2. WebRTC establishes direct connection
3. Changes sync directly between browsers
4. No cloud storage (completely private)

**Benefits:**
- Zero backend cost
- Maximum privacy (no cloud)
- Real-time sync

**Drawbacks:**
- Both users must be online simultaneously
- No sync when one user offline
- Complex to implement
- NAT/firewall issues

**Recommended For:**
- Privacy-first users
- Real-time body doubling (both online)

**Not Recommended For:**
- General sync (too unreliable)
- Backup (no persistence)

### Option 3: Self-Hosted Backend

**Tech Stack:**
- **Frontend:** Svelte (unchanged)
- **Backend:** Node.js + PostgreSQL or SQLite
- **Deployment:** User's own server (VPS, Raspberry Pi, etc.)

**Benefits:**
- Full control
- Ultimate privacy
- No vendor lock-in

**Drawbacks:**
- User must manage server
- Not suitable for non-technical users
- Infrastructure cost

**Recommended For:**
- Power users
- Self-hosters
- Paranoid privacy advocates

**Not Recommended For:**
- General population (too complex)

---

## RECOMMENDED STRATEGY: HYBRID APPROACH

### Phase 1 (Current): 100% Offline
- ✅ **Status:** Implemented
- **Features:** All core features, simulated multi-user
- **Sync:** Manual export/import
- **Cost:** $0
- **Privacy:** Maximum
- **Users:** Everyone

### Phase 2 (Near Future): Optional Sync
- **Status:** Not implemented, roadmap P3 (low priority)
- **Add:** Firebase/Supabase sync
- **Default:** Offline-first (unchanged for existing users)
- **Opt-In:** Users can enable cloud sync
- **Features Unlocked:**
  - Real couples mode
  - Real body doubling
  - Automatic cross-device sync
  - Automatic backup
- **Cost:** $0 for most users (free tier), <$1/month for power users
- **Privacy:** User chooses (can stay offline)

### Phase 3 (Future): Enhanced Collaboration
- **Status:** Not planned yet
- **Add:** Teams, shared outcomes, leaderboards
- **Requires:** Backend from Phase 2

---

## TECHNICAL IMPLEMENTATION (PHASE 2 PREVIEW)

### Sync Service Architecture

```typescript
// src/lib/sync/sync.ts
class SyncService {
  private db: IDBKeyVal // IndexedDB
  private cloud: FirebaseFirestore // Cloud storage
  private userId: string
  private online: boolean

  async initialize() {
    // Setup Firebase connection
    // Listen for online/offline events
    // Start sync loop
  }

  async push() {
    // Read all collections from IndexedDB
    // Compare with cloud (last modified timestamp)
    // Upload changes to Firestore
  }

  async pull() {
    // Read all collections from Firestore
    // Compare with IndexedDB
    // Download changes to IndexedDB
  }

  async resolveConflicts() {
    // Strategy: last-write-wins (simple)
    // Or: manual resolution (complex)
  }

  private startSyncLoop() {
    // Every 30 seconds, if online:
    setInterval(async () => {
      if (this.online) {
        await this.push()
        await this.pull()
      }
    }, 30000)
  }
}
```

### Firestore Schema (Example)

```
/users/{userId}
  /state
    - userState: UserState
  /tasks
    /{taskId}: Task
  /practices
    /{practiceId}: Practice
  /outcomes
    /{outcomeId}: Outcome
  /energyLogs
    /{logId}: EnergyLog
  /bptAnalysis
    - analysis: BPTAnalysis
  // ... all 21 collections

/couples/{coupleId}
  - profile: CouplesProfile
  /morningSyncs
    /{syncId}: MorningSync
  /sharedOutcomes
    /{outcomeId}: OutcomeNode
  /rewards
    /{rewardId}: CoupleReward

/bodyDoublingSessions/{sessionId}
  - session: BodyDoublingSession
  /participants
    /{userId}: ParticipantStatus
```

### Real-Time Couples Mode (Example)

```typescript
// CouplesMode.svelte
import { onSnapshot, doc } from 'firebase/firestore'

onMount(() => {
  const coupleId = getCoupleId()
  const docRef = doc(firestore, `couples/${coupleId}`)

  // Listen for partner's updates in real-time
  const unsubscribe = onSnapshot(docRef, (snapshot) => {
    const data = snapshot.data()
    // Update UI with partner's priorities, energy, etc.
    partnerPriorities = data.partner2Priorities
    partnerEnergy = data.partner2Energy
  })

  return () => unsubscribe()
})

async function submitMyPriorities(priorities: string[]) {
  // Write to Firestore (will sync to partner instantly)
  await updateDoc(doc(firestore, `couples/${coupleId}`), {
    partner1Priorities: priorities,
    partner1Energy: myEnergy
  })
  // Also write to local IndexedDB (offline backup)
  await saveToLocal()
}
```

**Result:** Partner sees updates within 1-2 seconds, even across the world.

---

## DECISION MATRIX: WHEN TO ADD BACKEND?

### Stay Offline-First If:
- ✅ Users are privacy-conscious
- ✅ Most users use single device
- ✅ Manual backup is acceptable
- ✅ Budget is $0
- ✅ Complexity should stay low

### Add Backend If:
- ❌ Real couples mode is critical feature
- ❌ Users demand cross-device sync
- ❌ Automatic backup is required
- ❌ Willing to pay ~$10-50/month (for Firebase/Supabase)
- ❌ Can invest 3-5 weeks development time

**Current Recommendation:** Stay offline-first until user demand is proven. The simulated couples mode demonstrates the UX without backend complexity.

---

## MIGRATION PATH (IF BACKEND ADDED)

### Step 1: Add Auth (Optional)
```typescript
// User can create account or stay anonymous
interface User {
  id: string
  email?: string // Optional
  isAnonymous: boolean
}
```

**Benefits:**
- Anonymous users: Stay 100% offline
- Authenticated users: Enable sync

### Step 2: Add Sync Service
```typescript
// Settings toggle
interface AppSettings {
  // ... existing
  cloudSyncEnabled: boolean
  lastSyncedAt?: string
}
```

**User Flow:**
1. Settings → Enable Cloud Sync
2. Optional: Create account or link existing
3. One-time upload of all data to cloud
4. From now on: auto-sync every 30 seconds

### Step 3: Migrate Couples Mode
```typescript
// Detect: Are both users on cloud sync?
if (partner1.cloudSyncEnabled && partner2.cloudSyncEnabled) {
  // Use real-time Firestore sync
  enableRealTimeCouplesMode()
} else {
  // Fall back to simulated mode
  enableSimulatedCouplesMode()
}
```

**Result:** Backward compatible. Offline users unchanged, cloud users get real features.

---

## FREQUENTLY ASKED QUESTIONS

### Q: Why not just add backend now?
**A:** Complexity. Backend adds auth, databases, hosting, monitoring, scaling, security, cost. Offline-first is simpler, cheaper, more private. Add backend only when user demand is clear.

### Q: Can couples mode work offline?
**A:** Not in real-time. But you can:
- Use simulated mode (current)
- Export/import JSON to share with partner manually
- Wait for backend implementation

### Q: What if I lose my phone?
**A:** Without backend: Data is lost unless you exported backups.
With backend (future): Data is safe in cloud, restore on new device.

**Current Recommendation:** Export backup weekly to Google Drive, Dropbox, etc.

### Q: Can I sync between laptop and phone?
**A:** Without backend: Export on laptop → import on phone (manual).
With backend (future): Automatic sync.

### Q: Is my data safe?
**A:** IndexedDB is persistent. Data survives:
- Browser restarts
- Months of inactivity
- OS updates

Data does NOT survive:
- Clearing browser storage (Settings → Clear Data)
- Uninstalling browser (mobile)
- Hard drive failure

**Recommendation:** Export backups regularly.

### Q: How big can my data get?
**A:** IndexedDB typically allows 50MB+ (browser-dependent). Your Lifer data is probably <1MB even after years of use. Not a concern.

### Q: Can I use multiple browsers?
**A:** Each browser has separate IndexedDB. Use export/import to move between Chrome, Firefox, Safari, etc.

---

## CONCLUSION

**Current Strategy:** 100% offline-first with manual export/import.

**Strengths:**
- Maximum privacy
- Zero cost
- Simple architecture
- Fast performance
- No vendor lock-in

**Limitations:**
- No real-time multi-user features
- No automatic cross-device sync
- No automatic backup

**Future Strategy:** Optional backend for users who want sync/collaboration.

**Recommended Next Steps:**
1. **Now:** Keep offline-first, validate user demand
2. **Later:** Add Firebase/Supabase sync as opt-in feature (Phase 2)
3. **Much Later:** Add team features, leaderboards, etc. (Phase 3)

**Philosophy:** Start simple, add complexity only when necessary. The current architecture serves 95% of users perfectly.
