import { useEffect, useState, type FormEvent } from 'react';
import { AdminApp } from './AdminApp';
import { api, ApiError, closeSession, hasSession, SESSION_EVENT } from './api';

/**
 * The door to the admin.
 *
 * The development server holds the password (`AVYOR_ADMIN_PASSWORD`, in
 * `.env.local`) and hands out a session token in exchange. Nothing here
 * compares anything: an unlocked screen with a locked API would only be a
 * decoration. The password is never kept, only the token, and only for the
 * time the tab is open.
 */
export function Gate() {
  const [open, setOpen] = useState(hasSession);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const configured =
    document.querySelector<HTMLMetaElement>('meta[name="avyor-admin-gate"]')?.content === 'ready';

  useEffect(() => {
    const sync = () => setOpen(hasSession());
    addEventListener(SESSION_EVENT, sync);
    return () => removeEventListener(SESSION_EVENT, sync);
  }, []);

  if (open) return <AdminApp onLock={closeSession} />;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.openSession(password);
      setPassword('');
    } catch (failure) {
      setError(failure instanceof ApiError ? failure.message : 'Connexion impossible.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-gate">
      <form className="admin-gate-card" onSubmit={submit}>
        <p className="admin-gate-eyebrow">AVYOR</p>
        <h1>Admin News</h1>
        {configured ? (
          <>
            <p className="admin-gate-note">
              Cette page ne s’ouvre que sur ce poste, et seulement avec le mot de passe.
            </p>
            <label htmlFor="admin-password">Mot de passe</label>
            <input
              id="admin-password"
              type="password"
              name="password"
              autoComplete="current-password"
              autoFocus
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button type="submit" disabled={busy || !password}>
              {busy ? 'Vérification…' : 'Entrer'}
            </button>
          </>
        ) : (
          <p className="admin-gate-note">
            Aucun mot de passe n’est configuré. Ajoutez <code>AVYOR_ADMIN_PASSWORD</code> dans{' '}
            <code>.env.local</code>, puis relancez <code>bun run dev</code>. Tant qu’il manque,
            l’admin reste fermée.
          </p>
        )}
        {error && (
          <p className="admin-gate-error" role="alert">
            {error}
          </p>
        )}
      </form>
    </main>
  );
}
