import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          Softlligence Technologies
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Sign in</h1>
        <p className="text-sm leading-relaxed text-mute">
          Access your manufacturing workspace. Credentials are verified by the API — never
          embedded in the client.
        </p>
      </header>
      <LoginForm />
    </main>
  );
}
