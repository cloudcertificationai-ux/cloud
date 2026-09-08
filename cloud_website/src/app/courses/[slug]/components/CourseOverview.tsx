import { Course } from '@/types';
import {
  CheckIcon,
  ClockIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  CodeBracketIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  BuildingOffice2Icon,
  UserGroupIcon,
  FireIcon,
} from '@heroicons/react/24/outline';
import CertificationBadge from '@/components/CertificationBadge';
import CareerPathway from '@/components/CareerPathway';
import { getCourseAboutInsights } from '@/lib/course-about-insights';

interface HandsOnProject {
  title: string;
  description: string;
  skills: string[];
  duration: string;
}

interface CaseStudy {
  company: string;
  industry: string;
  challenge: string;
  solution: string;
  outcome: string;
}

interface Certification {
  title: string;
  issuer: string;
  description: string;
}

interface CourseOverviewProps {
  course: Course & {
    learningOutcomes?: string[];
    handsOnProjects?: HandsOnProject[];
    caseStudies?: CaseStudy[];
    courseFeatures?: string[];
    requirements?: string[];
    certifications?: Certification[];
    language?: string;
  };
}

const DEMAND_STYLE: Record<string, { bg: string; text: string; bar: string }> = {
  Rising:     { bg: '#fef3c7', text: '#92400e', bar: '#f59e0b' },
  High:       { bg: '#dbeafe', text: '#1e40af', bar: '#3b82f6' },
  'Very High':{ bg: '#ffedd5', text: '#9a3412', bar: '#f97316' },
  Explosive:  { bg: '#fee2e2', text: '#991b1b', bar: '#ef4444' },
};

export default function CourseOverview({ course }: CourseOverviewProps) {
  const features = course.courseFeatures ?? [];
  const requirements = course.requirements ?? [];
  const handsOnProjects = course.handsOnProjects ?? [];
  const caseStudies = course.caseStudies ?? [];
  const certifications = course.certifications ?? [];
  const learningOutcomes = course.learningOutcomes ?? [];
  const language = course.language || 'English';
  const insights = getCourseAboutInsights(course);
  const demandStyle = DEMAND_STYLE[insights.demandLevel] ?? DEMAND_STYLE.High;

  const skillItems = [
    ...learningOutcomes,
    ...(course.tags ?? []).map((t) => `Master ${t} for senior developer roles`),
  ];

  const maxTrend = Math.max(...insights.googleTrends.points.map((p) => p.value), 1);

  return (
    <div className="space-y-10">
      {/* ── 1. About + Demand ── */}
      <section>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <h2 className="text-2xl font-bold text-gray-900">About This Course</h2>
          <span
            className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: demandStyle.bg, color: demandStyle.text }}
          >
            <FireIcon className="w-3.5 h-3.5" />
            Market demand: {insights.demandLevel}
          </span>
        </div>
        <p className="text-gray-600 leading-relaxed mb-5">{insights.aboutExtended}</p>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">{insights.demandSummary}</p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {insights.demandStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl p-4"
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                {stat.label}
              </p>
              <p className="text-xl font-extrabold text-gray-900 leading-none">{stat.value}</p>
              <p className="text-[11px] text-gray-500 mt-1.5">{stat.hint}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 2. Roles you can apply for ── */}
      <section>
        <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <BriefcaseIcon className="w-6 h-6 text-blue-600" />
          Roles You Can Apply For After This Course
        </h3>
        <p className="text-sm text-gray-500 mb-5">
          Target these positions once you complete the projects, labs, and assessments.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {insights.targetRoles.map((role) => (
            <div
              key={role.title}
              className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
              style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}
            >
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{role.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{role.level} level</p>
              </div>
              <span className="shrink-0 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                {role.salary}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. Google Trends demand ── */}
      <section>
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ArrowTrendingUpIcon className="w-6 h-6 text-sky-600" />
          Google Trends — Current Demand
        </h3>

        <div
          className="rounded-2xl p-5 sm:p-6"
          style={{ background: '#0f172a', border: '1px solid #1e293b' }}
        >
          {/* Keyword + region chips */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(14,165,233,0.15)', color: '#7dd3fc' }}
            >
              {insights.googleTrends.keyword}
            </span>
            <span
              className="text-xs font-medium px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(148,163,184,0.12)', color: '#94a3b8' }}
            >
              {insights.googleTrends.region}
            </span>
            <span
              className="text-[10px] font-medium px-2 py-1 rounded-full ml-auto"
              style={{ background: 'rgba(148,163,184,0.08)', color: '#64748b' }}
            >
              Index 0–100 · 12 months
            </span>
          </div>

          {/* Chart */}
          <div className="flex items-end gap-1.5 sm:gap-2 h-40 mb-2">
            {insights.googleTrends.points.map((pt) => {
              const h = Math.max(8, Math.round((pt.value / maxTrend) * 100));
              const isPeak = pt.value === maxTrend;
              return (
                <div key={pt.label} className="flex-1 flex flex-col items-center justify-end h-full gap-1.5">
                  <span
                    className="text-[9px] font-bold"
                    style={{ color: isPeak ? '#38bdf8' : '#64748b' }}
                  >
                    {pt.value}
                  </span>
                  <div
                    className="w-full rounded-t-md transition-all"
                    style={{
                      height: `${h}%`,
                      background: isPeak
                        ? 'linear-gradient(180deg,#38bdf8 0%,#0284c7 100%)'
                        : `linear-gradient(180deg, ${demandStyle.bar} 0%, #0ea5e9 100%)`,
                      minHeight: 8,
                      boxShadow: isPeak ? '0 0 12px rgba(56,189,248,0.45)' : undefined,
                    }}
                    title={`${pt.label}: ${pt.value}`}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 font-medium mb-5">
            {insights.googleTrends.points.map((pt) => (
              <span key={pt.label} className="flex-1 text-center">{pt.label}</span>
            ))}
          </div>

          {/* Visual insight metrics — no paragraph text */}
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4"
            style={{ borderTop: '1px solid #1e293b' }}
          >
            {(() => {
              const pts = insights.googleTrends.points;
              const first = pts[0]?.value ?? 0;
              const last = pts[pts.length - 1]?.value ?? 0;
              const peak = pts.reduce((a, b) => (b.value > a.value ? b : a), pts[0]);
              const growth = first > 0 ? Math.round(((last - first) / first) * 100) : 0;
              const up = growth >= 0;
              return [
                {
                  label: '12-mo change',
                  value: `${up ? '+' : ''}${growth}%`,
                  color: up ? '#34d399' : '#f87171',
                },
                {
                  label: 'Peak month',
                  value: peak?.label ?? '—',
                  color: '#38bdf8',
                },
                {
                  label: 'Peak interest',
                  value: String(peak?.value ?? '—'),
                  color: '#fbbf24',
                },
                {
                  label: 'Now',
                  value: String(last),
                  color: '#a78bfa',
                },
              ].map((m) => (
                <div
                  key={m.label}
                  className="rounded-xl px-3 py-3 text-center"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">{m.label}</p>
                  <p className="text-lg font-extrabold leading-none" style={{ color: m.color }}>
                    {m.value}
                  </p>
                </div>
              ));
            })()}
          </div>
        </div>
      </section>

      {/* ── 4. Official certifications we support ── */}
      <section>
        <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <AcademicCapIcon className="w-6 h-6 text-indigo-600" />
          Official Certifications We Support
        </h3>
        <p className="text-sm text-gray-500 mb-5">
          We help you prepare for recognised vendor certifications used by our enterprise clients.
          Mentorship, mock tests, and exam mapping are included where applicable.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.officialCerts.map((cert) => (
            <div
              key={cert.title}
              className="rounded-xl p-5"
              style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: '#eef2ff' }}
                >
                  <AcademicCapIcon className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wide text-indigo-600 mb-1">
                    {cert.issuer}
                  </p>
                  <h4 className="font-semibold text-gray-900 text-sm leading-snug mb-1.5">
                    {cert.title}
                  </h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{cert.description}</p>
                </div>
              </div>
            </div>
          ))}
          {certifications.map((cert, index) => (
            <CertificationBadge
              key={`db-${index}`}
              type="course"
              title={cert.title}
              issuer={cert.issuer}
              description={cert.description}
              variant="verified"
              issuedDate={new Date()}
            />
          ))}
        </div>
      </section>

      {/* ── 5. Hiring companies ── */}
      <section>
        <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <BuildingOffice2Icon className="w-6 h-6 text-emerald-600" />
          Hiring Companies for This Course
        </h3>
        <p className="text-sm text-gray-500 mb-5">
          Organisations that actively hire for skills covered in this program — including many of our training clients.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {insights.hiringCompanies.map((co) => (
            <div
              key={co.name}
              className="rounded-xl px-4 py-3.5 text-center"
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
            >
              <div className="w-9 h-9 rounded-full mx-auto mb-2 flex items-center justify-center text-sm font-extrabold text-white"
                style={{ background: 'linear-gradient(135deg,#0f172a,#1d4ed8)' }}>
                {co.name.charAt(0)}
              </div>
              <p className="text-sm font-bold text-gray-900">{co.name}</p>
              <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">
                {co.roles.join(' · ')}
              </p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-4 flex items-center gap-1.5">
          <UserGroupIcon className="w-4 h-4" />
          Placement support connects you with hiring partners across product, consulting, and IT services.
        </p>
      </section>

      {/* Job-Ready Skills */}
      {skillItems.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Job-Ready Skills You&apos;ll Master</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {skillItems.map((skill, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">{skill}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Hands-on Projects */}
      {handsOnProjects.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CodeBracketIcon className="w-6 h-6 text-blue-600" />
            Hands-on Projects
          </h3>
          <p className="text-gray-600 mb-6">
            Apply your learning through enterprise-level projects that simulate real company scenarios.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {handsOnProjects.map((project, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">{project.title}</h4>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{project.duration}</span>
                </div>
                <p className="text-gray-600 text-sm mb-4">{project.description}</p>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">Skills Applied:</p>
                  <div className="flex flex-wrap gap-1">
                    {project.skills.map((skill, si) => (
                      <span key={si} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{skill}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Real-world Case Studies */}
      {caseStudies.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BriefcaseIcon className="w-6 h-6 text-green-600" />
            Real-world Case Studies
          </h3>
          <div className="space-y-6">
            {caseStudies.map((study, index) => (
              <div key={index} className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <h4 className="font-semibold text-gray-900">{study.company}</h4>
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">{study.industry}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-700 mb-1">Challenge:</p>
                    <p className="text-gray-600">{study.challenge}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 mb-1">Solution:</p>
                    <p className="text-gray-600">{study.solution}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 mb-1">Outcome:</p>
                    <p className="text-green-700 font-medium">{study.outcome}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Course Features */}
      {features.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Course Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Requirements */}
      {requirements.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h3>
          <ul className="space-y-2">
            {requirements.map((req, index) => (
              <li key={index} className="flex items-center gap-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0" />
                <span className="text-gray-700">{req}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Course Details */}
      <section className="bg-gray-50 rounded-xl p-6" style={{ border: '1px solid #e2e8f0' }}>
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ChartBarIcon className="w-5 h-5 text-gray-500" />
          Course Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <ClockIcon className="w-6 h-6 text-blue-500" />
            <div>
              <p className="font-medium text-gray-900">Duration</p>
              <p className="text-sm text-gray-600">{course.duration.hours} hours</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <GlobeAltIcon className="w-6 h-6 text-green-500" />
            <div>
              <p className="font-medium text-gray-900">Language</p>
              <p className="text-sm text-gray-600">{language}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <DevicePhoneMobileIcon className="w-6 h-6 text-purple-500" />
            <div>
              <p className="font-medium text-gray-900">Access</p>
              <p className="text-sm text-gray-600">Mobile & Desktop</p>
            </div>
          </div>
        </div>
      </section>

      {/* Skills You'll Gain */}
      {(course.tags?.length ?? 0) > 0 && (
        <section>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Skills You&apos;ll Gain</h3>
          <div className="flex flex-wrap gap-2">
            {course.tags.map((tag, index) => (
              <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">{tag}</span>
            ))}
          </div>
        </section>
      )}

      {/* Career Pathways (populated) */}
      <CareerPathway
        pathways={insights.careerPaths}
        title="Your Career Journey Starts Here"
      />
    </div>
  );
}
