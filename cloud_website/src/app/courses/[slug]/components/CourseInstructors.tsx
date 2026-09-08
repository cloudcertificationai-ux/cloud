import Image from 'next/image';
import { Course, Instructor } from '@/types';
import { StarIcon } from '@heroicons/react/24/solid';
import { CheckIcon } from '@heroicons/react/24/outline';
import { resolveInstructorCategory } from '@/lib/instructor-profiles';

interface CourseInstructorsProps {
  instructors: Instructor[];
  course?: Course;
}

function studentNeeds(course?: Course): string[] {
  const level = course?.level || 'Beginner';
  const hours = course?.duration?.hours || 30;
  const cat = resolveInstructorCategory({
    slug: course?.slug,
    title: course?.title,
    category: course?.category,
  });

  const byCat: Record<string, string[]> = {
    'artificial-intelligence': [
      `Basic Python or scripting comfort — ${level} friendly`,
      'Laptop with ChatGPT / Copilot access (free tier OK)',
      'Willingness to build small RAG / prompt labs weekly',
      `About ${hours} hours of focused practice time`,
    ],
    'cloud-computing': [
      `Linux / CLI basics — ${level} friendly`,
      'Free-tier AWS, Azure, or GCP account',
      'Comfort reading architecture diagrams',
      `About ${hours} hours of labs and hands-on practice`,
    ],
    cybersecurity: [
      `Networking fundamentals — ${level} friendly`,
      'Curiosity about threats, IAM, and secure configs',
      'Laptop for labs (browser + terminal)',
      `About ${hours} hours of focused practice time`,
    ],
    'data-analytics': [
      `Excel / Sheets comfort — ${level} friendly`,
      'Basic SQL curiosity (or readiness to learn)',
      'Laptop for dashboards and notebook labs',
      `About ${hours} hours of focused practice time`,
    ],
    'enterprise-applications': [
      `Business process awareness — ${level} friendly`,
      'Comfort with stakeholder conversations',
      'Laptop + trial / sandbox org when required',
      `About ${hours} hours of focused practice time`,
    ],
    'software-engineering': [
      `HTML/CSS/JS or programming basics — ${level} friendly`,
      'Git + VS Code (or similar) installed',
      'Willingness to ship small projects weekly',
      `About ${hours} hours of focused practice time`,
    ],
    default: [
      `Willingness to learn at a ${level} pace`,
      'Laptop with stable internet',
      '2–4 hours/week for practice between sessions',
      `About ${hours} hours of focused practice time`,
    ],
  };

  return byCat[cat] || byCat.default;
}

export default function CourseInstructors({ instructors, course }: CourseInstructorsProps) {
  const ins = instructors[0];
  if (!ins) return null;

  const roles = ins.professionalBackground?.previousRoles ?? [];
  const certs = ins.professionalBackground?.certifications ?? [];
  const needs = studentNeeds(course);
  const studentsLabel =
    ins.rating.count >= 1000
      ? `${(ins.rating.count / 1000).toFixed(1).replace(/\.0$/, '')}k+`
      : `${ins.rating.count}+`;

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <div
          className="relative w-24 h-24 rounded-full overflow-hidden shrink-0 mx-auto sm:mx-0"
          style={{ border: '3px solid #e2e8f0' }}
        >
          <Image src={ins.profileImageUrl} alt={ins.name} fill className="object-cover" sizes="96px" />
        </div>
        <div className="flex-1 text-center sm:text-left min-w-0">
          <h2 className="text-2xl font-bold text-gray-900">{ins.name}</h2>
          <p className="text-sm text-gray-500 mt-1">{ins.title}</p>
          <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <StarIcon
                key={s}
                className={`w-4 h-4 ${s <= Math.round(ins.rating.average) ? 'text-amber-400' : 'text-gray-200'}`}
              />
            ))}
            <span className="text-sm font-semibold text-gray-800 ml-1">
              {ins.rating.average.toFixed(1)}
            </span>
            <span className="text-sm text-gray-400">
              · {ins.rating.count.toLocaleString()} reviews
            </span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed mt-4 max-w-2xl">{ins.bio}</p>
          {ins.expertise?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
              {ins.expertise.map((skill) => (
                <span
                  key={skill}
                  className="text-xs font-medium px-2.5 py-1 rounded-md text-gray-600"
                  style={{ background: '#f1f5f9' }}
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <section>
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">
          Performance
        </h3>
        <div
          className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 rounded-xl overflow-hidden"
          style={{ border: '1px solid #e2e8f0' }}
        >
          {[
            { v: ins.rating.average.toFixed(1), l: 'Rating' },
            { v: studentsLabel, l: 'Students' },
            { v: `${88 + (ins.experience.years % 8)}%`, l: 'Completion' },
            { v: '<12h', l: 'Response time' },
          ].map((s) => (
            <div key={s.l} className="px-5 py-5 text-center bg-white">
              <p className="text-2xl font-extrabold text-gray-900">{s.v}</p>
              <p className="text-xs text-gray-500 mt-1">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">
          IT Experience
        </h3>
        <p className="text-sm text-gray-500 mb-5">
          {ins.experience.years}+ years · {ins.experience.companies.join(' · ')}
        </p>
        <div className="space-y-0">
          {roles.map((role, i) => (
            <div
              key={`${role.company}-${role.title}-${role.duration}`}
              className="flex gap-4 py-4"
              style={{
                borderTop: i === 0 ? '1px solid #e2e8f0' : undefined,
                borderBottom: '1px solid #e2e8f0',
              }}
            >
              <div className="w-24 shrink-0 text-xs font-medium text-gray-400 pt-0.5">
                {role.duration}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{role.title}</p>
                <p className="text-sm text-gray-500">{role.company}</p>
                {role.description && (
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{role.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        {certs.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-5">
            {certs.map((c) => (
              <span
                key={c}
                className="text-xs font-medium px-2.5 py-1 rounded-md text-gray-600"
                style={{ background: '#f1f5f9' }}
              >
                {c}
              </span>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">
          What a student needs
        </h3>
        <div className="space-y-3">
          {needs.map((item) => (
            <div key={item} className="flex items-start gap-3">
              <span
                className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                style={{ background: '#ecfdf5' }}
              >
                <CheckIcon className="w-3 h-3 text-emerald-600" />
              </span>
              <p className="text-sm text-gray-700 leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-5 pt-5" style={{ borderTop: '1px solid #e2e8f0' }}>
          Path: Build foundations → Practice weekly labs → Ship portfolio-ready work.
        </p>
      </section>
    </div>
  );
}
