'use client'
import { useEffect, useRef, useState } from 'react'
import { ThumbsUp, Bookmark } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useStore } from '@/lib/store'

type Byte = { id: string; title: string; tag: string; url: string; creator_id?: string; upvotes: number }
const SAMPLE: Byte[] = [
  { id: 's1', title: 'Why does ice float? (Physics)', tag: 'Physics', upvotes: 12, url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm' },
  { id: 's2', title: 'SN1 vs SN2 in 60s', tag: 'Organic Chemistry', upvotes: 31, url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm' },
]
const TAGS = ['All', 'Physics', 'Organic Chemistry', 'Math', 'General Knowledge']

export default function VideoFeed() {
  const addCredits = useStore(s => s.addCredits)
  const [items, setItems] = useState<Byte[]>(SAMPLE)
  const [tag, setTag] = useState('All')
  const [liked, setLiked] = useState<Set<string>>(new Set())
  const [saved, setSaved] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!supabase) return
    supabase.from('videos').select('id,title,tag,storage_path,creator_id,upvotes').eq('status', 'approved')
      .order('created_at', { ascending: false }).limit(50).then(({ data }) => {
        if (data?.length) setItems(data.map(v => ({ ...v, url: supabase!.storage.from('videos').getPublicUrl(v.storage_path).data.publicUrl })))
      })
  }, [])

  const react = async (v: Byte, kind: 'upvote' | 'save') => {
    const [set, setSet] = kind === 'upvote' ? [liked, setLiked] : [saved, setSaved]
    if (set.has(v.id)) return
    setSet(new Set(set).add(v.id))
    if (supabase && v.creator_id) await supabase.rpc('react_to_video', { p_video: v.id, p_kind: kind }) // server awards creator bonus
    else addCredits(0, kind)
  }
  const shown = items.filter(v => tag === 'All' || v.tag === tag)
  return (
    <div className="relative h-full">
      <div className="absolute left-0 right-0 top-0 z-10 flex gap-2 overflow-x-auto p-3">
        {TAGS.map(t => <button key={t} onClick={() => setTag(t)}
          className={`whitespace-nowrap rounded-full px-3 py-1 text-xs backdrop-blur ${tag === t ? 'bg-indigo-600' : 'bg-black/50'}`}>{t}</button>)}</div>
      <div className="h-full snap-y snap-mandatory overflow-y-scroll">
        {shown.map(v => <Card key={v.id} v={v} liked={liked.has(v.id)} saved={saved.has(v.id)} onReact={react} />)}
      </div>
    </div>)
}

function Card({ v, liked, saved, onReact }: { v: Byte; liked: boolean; saved: boolean; onReact: (v: Byte, k: 'upvote' | 'save') => void }) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const el = ref.current!; const io = new IntersectionObserver(([e]) => e.isIntersecting ? el.play().catch(() => {}) : el.pause(), { threshold: 0.7 })
    io.observe(el); return () => io.disconnect()
  }, [])
  return (
    <div className="relative h-full snap-start bg-black">
      <video ref={ref} src={v.url} loop muted playsInline className="h-full w-full object-cover" onClick={e => { const t = e.currentTarget; t.paused ? t.play() : t.pause() }} />
      <div className="absolute bottom-0 left-0 right-16 bg-gradient-to-t from-black/80 p-4">
        <span className="rounded bg-indigo-600 px-2 py-0.5 text-xs">{v.tag}</span><p className="mt-1 font-semibold">{v.title}</p></div>
      <div className="absolute bottom-6 right-3 flex flex-col gap-4">
        <button onClick={() => onReact(v, 'upvote')} className={`flex flex-col items-center text-xs ${liked ? 'text-indigo-400' : ''}`}><ThumbsUp />{v.upvotes + (liked ? 1 : 0)}</button>
        <button onClick={() => onReact(v, 'save')} className={`flex flex-col items-center text-xs ${saved ? 'text-amber-400' : ''}`}><Bookmark />Save</button>
      </div>
    </div>)
}
