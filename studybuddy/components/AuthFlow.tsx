'use client'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, Mail, GraduationCap } from 'lucide-react'
import { sendOtp, verifyOtp, isMock, Kind } from '@/lib/supabase'
import { useStore } from '@/lib/store'

const EXAMS = ['First Year (FE)', 'Second Year (SE)', 'Third Year (TE)', 'Fourth Year (BE)']
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

  const card = 'apple-glass-card w-full max-w-sm p-6 sm:p-7 relative overflow-hidden text-[#FDF5EC] shadow-2xl';
  const input = 'w-full rounded-2xl border border-white/20 bg-black/40 px-4 py-3 text-sm text-[#FDF5EC] outline-none backdrop-blur-md focus:border-[#D97D29] focus:ring-2 focus:ring-[#D97D29]/30 placeholder:text-[#E8D6C4]/40';
  return (
    <div className="flex min-h-screen items-center justify-center forest-wallpaper-clean p-4 relative">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-none -z-10" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={card}>
        <div className="mb-6 flex items-center gap-3">
          <div className="apple-glass-icon flex h-10 w-10 items-center justify-center text-[#D97D29]">
            <GraduationCap className="h-5 w-5 text-[#E3A354]" />
          </div>
          <h1 className="text-2xl font-bold font-poppins text-white">StudyBuddy</h1>
        </div>
        {step === 'contact' && <>
          <div className="mb-4 grid grid-cols-2 rounded-2xl bg-black/40 border border-white/10 p-1">
            {(['email', 'phone'] as Kind[]).map(k => (
              <button key={k} onClick={() => { setKind(k); setContact('') }}
                className={`flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all ${kind === k ? 'bg-[#D97D29] text-white shadow-md' : 'text-[#E8D6C4]/70 hover:text-white'}`}>
                {k === 'email' ? <Mail size={15} /> : <Phone size={15} />}{k === 'email' ? 'Email' : 'Phone'}</button>))}
          </div>
          <input className={input} type={kind === 'email' ? 'email' : 'tel'} value={contact} onChange={e => setContact(e.target.value)}
            placeholder={kind === 'email' ? 'you@college.edu' : '+919876543210'} />
          {isMock && <p className="mt-2 text-xs text-[#E8D6C4]/80">Demo mode (no Supabase keys): OTP is 123456</p>}
          <button disabled={busy || contact.length < 6} onClick={send} className="mt-4 w-full rounded-2xl bg-[#D97D29] py-3 text-sm font-bold text-white shadow-lg shadow-[#D97D29]/30 hover:bg-[#BE6017] active:scale-95 disabled:opacity-40">Send OTP</button>
        </>}
        {step === 'otp' && <>
          <p className="mb-4 text-xs font-medium text-[#E8D6C4]">Enter the 6-digit code sent to {contact}</p>
          <div className="flex justify-between gap-2" onPaste={onPaste}>
            {digits.map((d, i) => <input key={i} ref={el => { refs.current[i] = el }} value={d} inputMode="numeric" maxLength={1}
              onChange={e => onDigit(i, e.target.value)} onKeyDown={e => onKey(i, e)}
              className="h-12 w-11 rounded-2xl border border-white/20 bg-black/40 text-center text-xl text-white outline-none focus:border-[#D97D29]" />)}
          </div>
          <button disabled={cool > 0 || busy} onClick={send} className="mt-4 text-xs font-semibold text-[#D97D29] disabled:text-zinc-500">
            {cool > 0 ? `Resend in ${cool}s` : 'Resend OTP'}</button>
        </>}
        {step === 'profile' && <>
          <input className={input} placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
          <div className="my-4 flex justify-between">{AVATARS.map(a => <button key={a} onClick={() => setAvatar(a)}
            className={`h-11 w-11 rounded-2xl text-2xl transition-all ${avatar === a ? 'apple-glass-icon bg-[#D97D29]/40 border-white/40' : 'bg-black/30 border border-white/10'}`}>{a}</button>)}</div>
          <label className="text-xs font-semibold text-[#E8D6C4]">Daily goal: {goal}h</label>
          <input type="range" min={1} max={14} value={goal} onChange={e => setGoal(+e.target.value)} className="w-full accent-[#D97D29]" />
          <label className="text-xs font-semibold text-[#E8D6C4] mt-3 block">Engineering Year</label>
          <div className="my-2 flex flex-wrap gap-2">{EXAMS.map(x => <button key={x} onClick={() => setExam(x)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${exam === x ? 'bg-[#D97D29] text-white shadow-md' : 'bg-white/10 text-[#E8D6C4] hover:text-white border border-white/10'}`}>{x}</button>)}</div>
          <button onClick={finish} className="w-full mt-2 rounded-2xl bg-[#D97D29] py-3 text-sm font-bold text-white shadow-lg shadow-[#D97D29]/30 hover:bg-[#BE6017]">Start studying</button>
        </>}
        {err && <p className="mt-3 text-xs text-red-400">{err}</p>}
      </motion.div>
    </div>)
}
