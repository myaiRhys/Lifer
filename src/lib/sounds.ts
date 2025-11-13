// Sound system using Web Audio API
class SoundSystem {
  private context: AudioContext | null = null
  private enabled = true

  constructor() {
    if (typeof window !== 'undefined') {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.enabled = localStorage.getItem('soundEnabled') !== 'false'
    }
  }

  toggle() {
    this.enabled = !this.enabled
    localStorage.setItem('soundEnabled', this.enabled.toString())
  }

  isEnabled() {
    return this.enabled
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.3) {
    if (!this.enabled || !this.context) return

    const oscillator = this.context.createOscillator()
    const gainNode = this.context.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.context.destination)

    oscillator.frequency.value = frequency
    oscillator.type = type
    gainNode.gain.value = volume

    oscillator.start(this.context.currentTime)
    oscillator.stop(this.context.currentTime + duration / 1000)
  }

  taskComplete(leverageScore: number) {
    if (!this.enabled || !this.context) return

    // Higher leverage = more satisfying sound
    const frequencies = leverageScore >= 7 ? [400, 500, 600, 700] : [400, 500, 600]
    frequencies.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 100, 'sine', 0.2), i * 50)
    })
  }

  levelUp() {
    if (!this.enabled || !this.context) return

    // Triumphant ascending melody
    const melody = [523, 659, 784, 1047] // C5, E5, G5, C6
    melody.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 200, 'square', 0.3), i * 150)
    })
  }

  achievementUnlocked() {
    if (!this.enabled || !this.context) return

    // Sparkly sound
    const notes = [659, 784, 880, 1047]
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 150, 'sine', 0.25), i * 80)
    })
  }

  streakMilestone(days: number) {
    if (!this.enabled || !this.context) return

    // Bigger streak = more dramatic sound
    const intensity = days >= 30 ? 5 : days >= 7 ? 4 : 3
    for (let i = 0; i < intensity; i++) {
      setTimeout(() => this.playTone(400 + i * 100, 100), i * 100)
    }
  }

  powerUpActivated() {
    if (!this.enabled || !this.context) return

    this.playTone(800, 100, 'square', 0.25)
    setTimeout(() => this.playTone(1000, 150, 'square', 0.25), 100)
  }

  challengeComplete() {
    if (!this.enabled || !this.context) return

    const notes = [523, 587, 659, 784, 880]
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 100, 'triangle', 0.2), i * 60)
    })
  }

  buttonClick() {
    if (!this.enabled || !this.context) return
    this.playTone(600, 30, 'sine', 0.1)
  }

  error() {
    if (!this.enabled || !this.context) return
    this.playTone(200, 200, 'sawtooth', 0.2)
  }
}

export const soundSystem = new SoundSystem()
