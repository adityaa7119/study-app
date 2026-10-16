'use client'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Lock, Volume2, VolumeX, AlertTriangle } from 'lucide-react'
import { useStore } from '@/lib/store'

const APPS = ['Instagram', 'YouTube', 'BGMI', 'Reddit', 'Snapchat', 'X (Twitter)']
const QUOTES = ['Discipline is choosing what you want most over what you want now.', 'Small daily wins build rank-one results.',
  'You will never regret the hour you studied.', 'Focus now, scroll later.']
const PENALTY = 50

export default function Blocker() {
  const addCredits = useStore(s => s.addCredits)
  const [blocked, setBlocked] = useState<string[]>(['Instagram', 'YouTube'])
  const [mins, setMins] = useState(45)
  const [endAt, setEndAt] = useState<number | null>(null)
  const [left, setLeft] = useState(0)
  const [sound, setSound] = useState(false)
  const [warn, setWarn] = useState('')
  const [q, setQ] = useState(0)
  const ctx = useRef<AudioContext | null>(null)
  const src = useRef<AudioBufferSourceNode | null>(null)

  const finish = (completed: boolean) => {
    setEndAt(null); setWarn('')
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    if (completed) addCredits(Math.round(mins / 3), 'focus_session_complete')
    else addCredits(-PENALTY, 'emergency_exit_penalty')
  }
  const start = async () => {
    setEndAt(Date.now() + mins * 60000); setLeft(mins * 60)
    try { await document.documentElement.requestFullscreen() } catch {}
  }

  // countdown
  useEffect(() => {
    if (!endAt) return
    const t = setInterval(() => {
      const s = Math.max(0, Math.round((endAt - Date.now()) / 1000)); setLeft(s)
      if (s === 0) finish(true)
    }, 500)
    const qi = setInterval(() => setQ(x => (x + 1) % QUOTES.length), 12000)
    return () => { clearInterval(t); clearInterval(qi) }
  }, [endAt]) // eslint-disable-line

  // strict mode: block tab leave / reload / back
  useEffect(() => {
    if (!endAt) return
    const beforeUnload = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = '' }
    const vis = () => { if (document.hidden) setWarn('Tab switch detected. Stay focused!') }
    const keys = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && ['t', 'w', 'l', 'n'].includes(e.key.toLowerCase())) e.preventDefault() }
    history.pushState(null, '', location.href)
    const pop = () => history.pushState(null, '', location.href)
    window.addEventListener('beforeunload', beforeUnload); document.addEventListener('visibilitychange', vis)
    window.addEventListener('keydown', keys); window.addEventListener('popstate', pop)
    return () => { window.removeEventListener('beforeunload', beforeUnload); document.removeEventListener('visibilitychange', vis)
      window.removeEventListener('keydown', keys); window.removeEventListener('popstate', pop) }
  }, [endAt])

  // ambient lofi-style brown noise via Web Audio
  useEffect(() => {
    if (!sound || !endAt) { src.current?.stop(); src.current = null; return }
    const c = ctx.current ?? new AudioContext(); ctx.current = c
    const buf = c.createBuffer(1, c.sampleRate * 4, c.sampleRate); const d = buf.getChannelData(0); let last = 0
    for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5 }
    const s = c.createBufferSource(); s.buffer = buf; s.loop = true
    const g = c.createGain(); g.gain.value = 0.35; s.connect(g).connect(c.destination); s.start(); src.current = s
    return () => { s.stop() }
  }, [sound, endAt])

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  return (
    <div className="space-y-5 p-4">
      <section className="space-y-2">
        <h2 className="font-semibold">Distracting apps</h2>
        {APPS.map(a => { const on = blocked.includes(a); return (
          <div key={a} className="flex items-center justify-between rounded-2xl bg-zinc-900 px-4 py-3">
            <span>{a}</span>
            <button role="switch" aria-checked={on} onClick={() => setBlocked(on ? blocked.filter(x => x !== a) : [...blocked, a])}
              className={`h-6 w-11 rounded-full p-0.5 transition ${on ? 'bg-indigo-600' : 'bg-zinc-700'}`}>
              <span className={`block h-5 w-5 rounded-full bg-white transition ${on ? 'translate-x-5' : ''}`} /></button>
          </div>) })}
      </section>
      <section className="rounded-2xl bg-zinc-900 p-4">
        <div className="mb-2 flex justify-between"><span>Lock duration</span><b>{mins} min</b></div>
        <input type="range" min={15} max={180} step={5} value={mins} onChange={e => setMins(+e.target.value)} className="w-full accent-indigo-500" />
        <p className="mt-2 flex items-center gap-1 text-xs text-amber-400"><AlertTriangle size={12} /> Quitting early costs {PENALTY} credits.</p>
        <button onClick={start} disabled={!blocked.length} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 font-semibold disabled:opacity-40">
          <Lock size={18} /> Start focus shield</button>
      </section>
      <AnimatePresence>{endAt && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 p-6 text-center">
          <Lock className="mb-4 text-indigo-400" size={40} />
          <p className="text-7xl font-bold tabular-nums">{fmt(left)}</p>
          <p className="mt-2 text-sm text-zinc-500">Blocked: {blocked.join(', ')}</p>
          <p className="mt-8 max-w-xs text-lg italic text-zinc-300">“{QUOTES[q]}”</p>
          {warn && <p className="mt-4 text-sm text-red-400">{warn}</p>}
          <div className="mt-10 flex gap-3">
            <button onClick={() => setSound(!sound)} className="flex items-center gap-2 rounded-full bg-zinc-800 px-4 py-2 text-sm">
              {sound ? <Volume2 size={16} /> : <VolumeX size={16} />} Lofi ambience</button>
            <button onClick={() => { if (confirm(`Quit now and lose ${PENALTY} credits?`)) finish(false) }}
              className="rounded-full border border-red-500/50 px-4 py-2 text-sm text-red-400">Emergency exit</button>
          </div>
        </motion.div>)}</AnimatePresence>
    </div>)
}
