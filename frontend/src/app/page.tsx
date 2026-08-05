import { StatusPanel } from '@/components/foundation/StatusPanel';
import { SessionPanel } from '@/components/auth/SessionPanel';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-shell px-6 pb-16 pt-20 sm:pt-24">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          Softlligence Technologies
        </p>
        <h1 className="font-display text-[clamp(1.85rem,4vw,2.5rem)] font-semibold leading-tight tracking-tight text-ink">
          Softlligence Manufacturing Cloud
        </h1>
        <p className="max-w-lg text-[0.95rem] leading-relaxed text-mute">
          Multi-tenant manufacturing platform — Foundation and Identity are live locally.
        </p>
      </header>
      <SessionPanel />
      <StatusPanel />
    </main>
  );
}
