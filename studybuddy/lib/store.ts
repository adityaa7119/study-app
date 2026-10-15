import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from './supabase'

export type Profile = { id: string; name: string; avatar: string; goalHours: number; exam: string }
export type Alarm = { id: string; label: string; time: string; on: boolean }
type S = {
  profile: Profile | null; credits: number; alarms: Alarm[]
  setProfile: (p: Profile | null) => void
  addCredits: (n: number, reason: string) => void
  setAlarms: (a: Alarm[]) => void
}
export const useStore = create<S>()(persist((set, get) => ({
  profile: null, credits: 100, alarms: [],
  setProfile: (profile) => set({ profile }),
  setAlarms: (alarms) => set({ alarms }),
  addCredits: (n, reason) => {
    set({ credits: Math.max(0, get().credits + n) })
    const p = get().profile
    if (supabase && p) supabase.from('transactions').insert({ user_id: p.id, amount: n, reason }).then(() => {})
  },
}), { name: 'studybuddy' }))
