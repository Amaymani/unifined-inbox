import Link from "next/link";

export default function HeroPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 text-white px-6">
      <div className="max-w-5xl text-center space-y-8">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
          Unified Inbox for Multi-Channel Outreach
        </h1>
        <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto">
          Centralize conversations from <span className="font-semibold">SMS, WhatsApp, Email, and Social Media</span> 
          into one collaborative workspace. Streamline customer engagement, track analytics, 
          and empower your team — all in one unified platform.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/dashboard"
            className="rounded-md bg-blue-600 hover:bg-blue-700 transition-colors px-6 py-3 text-lg font-semibold"
          >
            Launch App
          </Link>
          <Link
            href="/docs"
            className="rounded-md border border-white/30 hover:bg-white/10 transition-colors px-6 py-3 text-lg font-semibold"
          >
            View Docs
          </Link>
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-slate-400">
          <p>Next.js 14 (App Router)</p>
          <p>Twilio • WhatsApp • Email • Facebook • Twitter</p>
          <p>Postgres + Prisma • Better Auth</p>
        </div>
      </div>

      <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-slate-900 to-transparent"></div>
    </main>
  );
}
