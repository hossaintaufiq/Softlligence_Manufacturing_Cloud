import { StatusPanel } from '@/components/foundation/StatusPanel';

export default function HomePage() {
  return (
    <main className="shell">
      <header className="hero">
        <p className="eyebrow">Softlligence Technologies</p>
        <h1>Softlligence Manufacturing Cloud</h1>
        <p className="lede">
          Multi-tenant manufacturing platform foundation — Section 1 is live locally.
        </p>
      </header>
      <StatusPanel />
    </main>
  );
}
