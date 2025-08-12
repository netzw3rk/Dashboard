'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

type Sub = {
  id: string;
  name: string;
  price_cents: number;
  billing_interval: 'week'|'month'|'year';
  next_renewal: string | null;
  cancel_notice_days: number | null;
};

export default function Dashboard() {
  const [sessionReady, setSessionReady] = useState(false);
  const [subs, setSubs] = useState<Sub[]>([]);
  const [form, setForm] = useState({
    name: '',
    price_cents: 0,
    billing_interval: 'month',
    next_renewal: '',
    cancel_notice_days: 0
  });
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push('/login');
      else {
        setSessionReady(true);
        loadSubs();
      }
    });
  }, []);

  async function loadSubs() {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setSubs(data as Sub[]);
  }

  async function addSub(e: React.FormEvent) {
    e.preventDefault();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push('/login');

    const { error } = await supabase.from('subscriptions').insert([{
      user_id: user.id,
      name: form.name,
      price_cents: Number(form.price_cents),
      billing_interval: form.billing_interval,
      next_renewal: form.next_renewal || null,
      cancel_notice_days: Number(form.cancel_notice_days) || 0
    }]);

    if (!error) {
      setForm({ name:'', price_cents:0, billing_interval:'month', next_renewal:'', cancel_notice_days:0 });
      await loadSubs();
    } else {
      alert(error.message);
    }
  }

  if (!sessionReady) return null;

  return (
    <main style={{ maxWidth: 800, margin: '2rem auto', padding: 24 }}>
      <h1>Deine Abos</h1>

      <form onSubmit={addSub} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, margin:'1rem 0' }}>
        <input required placeholder="Name (z. B. Notion)" value={form.name}
               onChange={e=>setForm(f=>({ ...f, name:e.target.value }))} />
        <input type="number" placeholder="Preis in Cent (z. B. 990)" value={form.price_cents}
               onChange={e=>setForm(f=>({ ...f, price_cents:Number(e.target.value) }))} />
        <select value={form.billing_interval}
                onChange={e=>setForm(f=>({ ...f, billing_interval:e.target.value as any }))}>
          <option value="week">wöchentlich</option>
          <option value="month">monatlich</option>
          <option value="year">jährlich</option>
        </select>
        <input type="date" value={form.next_renewal}
               onChange={e=>setForm(f=>({ ...f, next_renewal:e.target.value }))} />
        <input type="number" placeholder="Kündigungsfrist in Tagen" value={form.cancel_notice_days}
               onChange={e=>setForm(f=>({ ...f, cancel_notice_days:Number(e.target.value) }))} />
        <button type="submit">Abo hinzufügen</button>
      </form>

      <ul>
        {subs.map(s => (
          <li key={s.id} style={{ padding:'8px 0', borderBottom:'1px solid #eee' }}>
            <strong>{s.name}</strong> — {(s.price_cents/100).toFixed(2)} € / {s.billing_interval}
            {s.next_renewal ? ` | Nächste Abbuchung: ${s.next_renewal}` : ''}
          </li>
        ))}
      </ul>
    </main>
  );
}
