import { getSettings } from './db/settings'
import { getUserState, getActiveTasks } from './db'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'streak' | 'morning'
  timestamp: string
}

class NotificationSystem {
  private permissionGranted: boolean = false

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('Browser does not support notifications')
      return false
    }

    if (Notification.permission === 'granted') {
      this.permissionGranted = true
      return true
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      this.permissionGranted = permission === 'granted'
      return this.permissionGranted
    }

    return false
  }

  async showNotification(title: string, body: string, icon?: string) {
    const settings = await getSettings()

    if (!settings.notificationsEnabled) return

    if (!this.permissionGranted) {
      await this.requestPermission()
    }

    if (this.permissionGranted) {
      new Notification(title, {
        body,
        icon: icon || '/lifer/icons/icon-192.svg',
        badge: '/lifer/icons/icon-192.svg',
        tag: 'lifer-notification',
        renotify: true
      })
    }
  }

  async checkMorningWindow() {
    const now = new Date()
    const hour = now.getHours()

    // Check if it's morning (6 AM - 9 AM)
    if (hour >= 6 && hour < 9) {
      const tasks = await getActiveTasks()
      const morningTasks = tasks.filter(t => t.isMorningTask)

      if (morningTasks.length > 0) {
        const minutesLeft = (9 - hour) * 60 - now.getMinutes()

        if (minutesLeft <= 30) {
          await this.showNotification(
            '⏰ Morning Window Closing Soon!',
            `You have ${morningTasks.length} morning task(s) left. ${minutesLeft} minutes remaining to get your morning multiplier!`
          )
        }
      }
    }
  }

  async checkStreakRisk() {
    const settings = await getSettings()
    if (!settings.streakReminders) return

    const now = new Date()
    const hour = now.getHours()

    // Check late evening (8 PM - 11 PM)
    if (hour >= 20 && hour < 23) {
      const userState = await getUserState()
      const tasks = await getActiveTasks()

      if (userState && userState.currentStreak > 0 && tasks.length > 0) {
        await this.showNotification(
          '🔥 Protect Your Streak!',
          `You have ${tasks.length} active task(s). Complete them to maintain your ${userState.currentStreak}-day streak!`
        )
      }
    }
  }

  async scheduleNotifications() {
    const settings = await getSettings()

    if (!settings.notificationsEnabled) return

    // Request permission on first run
    await this.requestPermission()

    // Check morning window every 15 minutes
    if (settings.morningReminders) {
      setInterval(() => this.checkMorningWindow(), 15 * 60 * 1000)
    }

    // Check streak risk every 30 minutes
    if (settings.streakReminders) {
      setInterval(() => this.checkStreakRisk(), 30 * 60 * 1000)
    }
  }

  async notifyLevelUp(level: number) {
    await this.showNotification(
      '🎉 Level Up!',
      `Congratulations! You've reached level ${level}!`
    )
  }

  async notifyAchievement(name: string) {
    await this.showNotification(
      '🏆 Achievement Unlocked!',
      name
    )
  }

  async notifyStreakMilestone(days: number) {
    await this.showNotification(
      '🔥 Streak Milestone!',
      `${days} days and counting! Keep it up!`
    )
  }

  async showTimerComplete(title: string, body: string) {
    // Always show timer notifications regardless of general settings
    // This is specifically requested for timer functionality
    if (!this.permissionGranted) {
      await this.requestPermission()
    }

    if ('Notification' in window && this.permissionGranted) {
      const notification = new Notification(title, {
        body,
        icon: '/lifer/icons/icon-192.svg',
        badge: '/lifer/icons/icon-192.svg',
        tag: 'lifer-timer',
        requireInteraction: true, // Notification stays until user interacts
        vibrate: [200, 100, 200], // Vibration pattern for mobile
        silent: false
      })

      // Play sound on click
      notification.onclick = () => {
        window.focus()
        notification.close()
      }
    }

    // Also vibrate if supported (for when app is open)
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 200])
    }
  }
}

export const notificationSystem = new NotificationSystem()
