'use client'
import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, BellRing } from 'lucide-react'
import { useStore, Alarm } from '@/lib/store'

const PRESETS = ['Wake up', 'Formula revision', 'Mock test', 'Sleep']
const CARDS = [{ q: 'SI unit of force?', a: 'newton' }, { q: 'Chemical symbol of sodium?', a: 'na' },
  { q: 'Derivative of sin x?', a: 'cos x' }, { q: 'Powerhouse of the cell?', a: 'mitochondria' }]
const newChallenge = () => {
  if (Math.random() < 0.6) { const a = 12 + Math.floor(Math.random() * 38), b = 3 + Math.floor(Math.random() * 12)
    return { q: `${a} × ${b} = ?`, a: String(a * b) } }
  return CARDS[Math.floor(Math.random() * CARDS.length)]
}

export default function AlarmManager() {
  const { alarms, setAlarms } = useStore()
  const [label, setLabel] = useState(PRESETS[0]); const [time, setTime] = useState('06:00')
  const [ringing, setRinging] = useState<Alarm | null>(null)
  const [ans, setAns] = useState(''); const [wrong, setWrong] = useState(false)
  const [ch, setCh] = useState(newChallenge)

  useEffect(() => {
    const t = setInterval(() => {
      if (ringing) return
      const n = new Date(); const hm = `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`
      const hit = alarms.find(a => a.on && a.time === hm && n.getSeconds() < 5)
      if (hit) { setRinging(hit); setCh(newChallenge()); setAns('') }
    }, 1000)
    return () => clearInterval(t)
  }, [alarms, ringing])

  // repeating beep while ringing
  useEffect(() => {
    if (!ringing) return
    const c = new AudioContext()
    const beep = () => { const o = c.createOscillator(), g = c.createGain(); o.frequency.value = 880; g.gain.value = 0.2
      o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime + 0.25) }
    beep(); const i = setInterval(beep, 600)
    return () => { clearInterval(i); c.close() }
  }, [ringing])

  const sorted = useMemo(() => [...alarms].sort((a, b) => a.time.localeCompare(b.time)), [alarms])
  const add = () => setAlarms([...alarms, { id: crypto.randomUUID(), label, time, on: true }])
  const submit = () => {
    if (ans.trim().toLowerCase() === ch.a.toLowerCase()) { setRinging(null); setWrong(false) }
    else { setWrong(true); setAns(''); setCh(newChallenge()) }
  }
  return (
    <div className="space-y-4 p-4">
      <div className="space-y-3 rounded-2xl bg-zinc-900 p-4">
        <div className="flex gap-2">
          <input type="time" value={time} onChange={e => setTime(e.target.value)} className="rounded-xl bg-zinc-950 px-3 py-2" />
          <input list="presets" value={label} onChange={e => setLabel(e.target.value)} className="min-w-0 flex-1 rounded-xl bg-zinc-950 px-3 py-2" />
          <datalist id="presets">{PRESETS.map(p => <option key={p} value={p} />)}</datalist>
        </div>
        <button onClick={add} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2 font-semibold"><Plus size={18} /> Add alarm</button>
      </div>
      {sorted.length === 0 && <p className="text-center text-sm text-zinc-500">No alarms yet.</p>}
      {sorted.map(a => (
        <div key={a.id} className="flex items-center justify-between rounded-2xl bg-zinc-900 px-4 py-3">
          <div><p className="text-2xl font-semibold tabular-nums">{a.time}</p><p className="text-xs text-zinc-400">{a.label}</p></div>
          <div className="flex items-center gap-3">
            <button role="switch" aria-checked={a.on} onClick={() => setAlarms(alarms.map(x => x.id === a.id ? { ...x, on: !x.on } : x))}
              className={`h-6 w-11 rounded-full p-0.5 ${a.on ? 'bg-indigo-600' : 'bg-zinc-700'}`}>
              <span className={`block h-5 w-5 rounded-full bg-white transition ${a.on ? 'translate-x-5' : ''}`} /></button>
            <button onClick={() => setAlarms(alarms.filter(x => x.id !== a.id))} className="text-zinc-500"><Trash2 size={18} /></button>
          </div>
        </div>))}
      {ringing && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950/95 p-6 text-center">
          <BellRing className="mb-3 animate-bounce text-amber-400" size={48} />
          <h2 className="text-3xl font-bold">{ringing.label}</h2>
          <p className="mb-6 text-zinc-400">Solve to dismiss</p>
          <p className="mb-3 text-2xl">{ch.q}</p>
          <input autoFocus value={ans} onChange={e => setAns(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()}
            className="w-64 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-center text-xl outline-none focus:border-indigo-500" />
          {wrong && <p className="mt-2 text-sm text-red-400">Wrong — try this one.</p>}
          <button onClick={submit} className="mt-4 w-64 rounded-xl bg-indigo-600 py-3 font-semibold">Dismiss</button>
        </div>)}
    </div>)
}
