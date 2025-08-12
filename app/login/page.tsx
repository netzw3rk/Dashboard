'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [error, setError] = useState<string|null>(null);
  const router = useRouter();

  async function onSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signUp({ email, password: pw });
    if (error) return setError(error.message);
    router.push('/dashboard');
  }

  async function onSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    if (error) return setError(error.message);
    router.push('/dashboard');
  }

  return (
    <main style={{ maxWidth: 420, margin: '4rem auto', padding: 24 }}>
      <h1>Login</h1>
      <form style={{ display:'grid', gap: 12 }}>
        <input placeholder="E-Mail" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="Passwort" type="password" value={pw} onChange={e=>setPw(e.target.value)} />
        <button onClick={onSignIn}>Einloggen</button>
        <button onClick={onSignUp} type="button">Registrieren</button>
        {error && <p style={{color:'crimson'}}>{error}</p>}
      </form>
    </main>
  );
}
