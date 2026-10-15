'use client'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, Mail, GraduationCap } from 'lucide-react'
import { sendOtp, verifyOtp, isMock, Kind } from '@/lib/supabase'
import { useStore } from '@/lib/store'

const EXAMS = ['JEE', 'NEET', 'UPSC', 'CAT', 'GATE', 'Boards']
const AVATARS = ['🧑‍🎓', '🦊', '🐼', '🚀', '🧠', '⚡']

export default function AuthFlow() {
  const setProfile = useStore(s => s.setProfile)
  const [kind, setKind] = useState<Kind>('email')
  const [contact, setContact] = useState('')
  const [step, setStep] = useState<'contact' | 'otp' | 'profile'>('contact')
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''))
  const [cool, setCool] = useState(0)
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false)
  const [uid, setUid] = useState('')
  const [name, setName] = useState(''); const [avatar, setAvatar] = useState(AVATARS[0])
  const [goal, setGoal] = useState(4); const [exam, setExam] = useState(EXAMS[0])
  const refs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => { if (cool <= 0) return; const t = setTimeout(() => setCool(cool - 1), 1000); return () => clearTimeout(t) }, [cool])
  useEffect(() => { if (step === 'otp') refs.current[0]?.focus() }, [step])

  const send = async () => {
    setErr(''); setBusy(true)
    try { await sendOtp(contact.trim(), kind); setStep('otp'); setCool(60); setDigits(Array(6).fill('')) }
    catch (e: any) { setErr(e.message) } finally { setBusy(false) }
  }
  const verify = async (code: string) => {
    setBusy(true); setErr('')
    try { setUid(await verifyOtp(contact.trim(), kind, code)); setStep('profile') }
    catch (e: any) { setErr(e.message); setDigits(Array(6).fill('')); refs.current[0]?.focus() }
    finally { setBusy(false) }
  }
  const onDigit = (i: number, v: string) => {
    const c = v.replace(/\D/g, '').slice(-1)
    const next = [...digits]; next[i] = c; setDigits(next)
    if (c && i < 5) refs.current[i + 1]?.focus()
    if (next.every(Boolean)) verify(next.join(''))
  }
  const onKey = (i: number, e: React.KeyboardEvent) => { if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus() }
  const onPaste = (e: React.ClipboardEvent) => {
    const t = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (t.length === 6) { setDigits(t.split('')); verify(t) }
  }
  const finish = () => setProfile({ id: uid, name: name.trim() || 'Student', avatar, goalHours: goal, exam })

  const card = 'w-full max-w-sm rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 backdrop-blur'
  const input = 'w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-indigo-500'
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-indigo-950/40 to-zinc-950 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={card}>
        <div className="mb-6 flex items-center gap-2"><GraduationCap className="text-indigo-400" /><h1 className="text-2xl font-bold">StudyBuddy</h1></div>
        {step === 'contact' && <>
          <div className="mb-4 grid grid-cols-2 rounded-xl bg-zinc-950 p-1">
            {(['email', 'phone'] as Kind[]).map(k => (
              <button key={k} onClick={() => { setKind(k); setContact('') }}
                className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm ${kind === k ? 'bg-indigo-600' : 'text-zinc-400'}`}>
                {k === 'email' ? <Mail size={16} /> : <Phone size={16} />}{k === 'email' ? 'Email' : 'Phone'}</button>))}
          </div>
          <input className={input} type={kind === 'email' ? 'email' : 'tel'} value={contact} onChange={e => setContact(e.target.value)}
            placeholder={kind === 'email' ? 'you@school.com' : '+919876543210'} />
          {isMock && <p className="mt-2 text-xs text-zinc-500">Demo mode (no Supabase keys): OTP is 123456</p>}
          <button disabled={busy || contact.length < 6} onClick={send} className="mt-4 w-full rounded-xl bg-indigo-600 py-3 font-semibold disabled:opacity-40">Send OTP</button>
        </>}
        {step === 'otp' && <>
          <p className="mb-4 text-sm text-zinc-400">Enter the 6-digit code sent to {contact}</p>
          <div className="flex justify-between gap-2" onPaste={onPaste}>
            {digits.map((d, i) => <input key={i} ref={el => { refs.current[i] = el }} value={d} inputMode="numeric" maxLength={1}
              onChange={e => onDigit(i, e.target.value)} onKeyDown={e => onKey(i, e)}
              className="h-12 w-11 rounded-xl border border-zinc-700 bg-zinc-950 text-center text-xl outline-none focus:border-indigo-500" />)}
          </div>
          <button disabled={cool > 0 || busy} onClick={send} className="mt-4 text-sm text-indigo-400 disabled:text-zinc-600">
            {cool > 0 ? `Resend in ${cool}s` : 'Resend OTP'}</button>
        </>}
        {step === 'profile' && <>
          <input className={input} placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
          <div className="my-4 flex justify-between">{AVATARS.map(a => <button key={a} onClick={() => setAvatar(a)}
            className={`h-11 w-11 rounded-full text-2xl ${avatar === a ? 'bg-indigo-600' : 'bg-zinc-800'}`}>{a}</button>)}</div>
          <label className="text-sm text-zinc-400">Daily goal: {goal}h</label>
          <input type="range" min={1} max={14} value={goal} onChange={e => setGoal(+e.target.value)} className="w-full accent-indigo-500" />
          <div className="my-4 flex flex-wrap gap-2">{EXAMS.map(x => <button key={x} onClick={() => setExam(x)}
            className={`rounded-full px-3 py-1 text-sm ${exam === x ? 'bg-indigo-600' : 'bg-zinc-800'}`}>{x}</button>)}</div>
          <button onClick={finish} className="w-full rounded-xl bg-indigo-600 py-3 font-semibold">Start studying</button>
        </>}
        {err && <p className="mt-3 text-sm text-red-400">{err}</p>}
      </motion.div>
    </div>)
}
