import { createClient } from '@supabase/supabase-js'
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
export const isMock = !url || !key
export const supabase = isMock ? null : createClient(url!, key!, { auth: { persistSession: true } })
export type Kind = 'phone' | 'email'

export async function sendOtp(contact: string, kind: Kind) {
  if (!supabase) return // mock mode: any contact accepted, OTP is 123456
  const { error } = await supabase.auth.signInWithOtp(kind === 'phone' ? { phone: contact } : { email: contact })
  if (error) throw error
}
export async function verifyOtp(contact: string, kind: Kind, token: string): Promise<string> {
  if (!supabase) {
    if (token !== '123456') throw new Error('Demo mode: use code 123456')
    return contact
  }
  const { data, error } = await supabase.auth.verifyOtp(
    kind === 'phone' ? { phone: contact, token, type: 'sms' } : { email: contact, token, type: 'email' })
  if (error || !data.user) throw error ?? new Error('Verification failed')
  return data.user.id
}
