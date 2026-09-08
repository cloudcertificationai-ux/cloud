import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free LMS | CloudCertification',
  description: 'Access free learning management system courses and start building industry-ready skills at no cost.',
};

export default function FreeLmsPage() {
  return (
    <main className="min-h-[70vh] bg-slate-50">
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
          Free LMS
        </p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Learn for free. Build real skills.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          Explore free courses, practice labs, and learning paths inside the CloudCertification LMS — no payment required to get started.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/courses?price=free"
            className="inline-flex items-center rounded-lg bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600"
          >
            Browse Free Courses
          </Link>
          <Link
            href="/auth/signin?callbackUrl=/dashboard"
            className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            Open LMS Dashboard
          </Link>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            { title: 'Self-paced lessons', body: 'Learn anytime with structured modules and progress tracking.' },
            { title: 'Practice projects', body: 'Apply concepts with hands-on tasks designed for job readiness.' },
            { title: 'Certificates path', body: 'Upgrade later to certified tracks when you are ready.' },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-bold text-slate-900">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
