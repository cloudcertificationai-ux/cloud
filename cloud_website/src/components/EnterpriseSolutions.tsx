'use client';

import React from 'react';
import { EnterpriseSolution, CompanyLogo, CaseStudy } from '@/types';
import { OptimizedImage } from '@/components';

interface EnterpriseSolutionsProps {
  solutions: EnterpriseSolution[];
  clientLogos: CompanyLogo[];
  caseStudies: CaseStudy[];
  onContactClick: () => void;
  onDemoClick: () => void;
}

const CATEGORY_STYLE: Record<string, { bg: string; border: string; text: string; chipBg: string; chipText: string }> = {
  training: { bg: 'rgba(29,78,216,0.08)', border: 'rgba(29,78,216,0.16)', text: '#1d4ed8', chipBg: 'rgba(29,78,216,0.1)', chipText: '#1d4ed8' },
  platform: { bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.16)', text: '#7c3aed', chipBg: 'rgba(139,92,246,0.1)', chipText: '#7c3aed' },
  consulting: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.16)', text: '#b45309', chipBg: 'rgba(245,158,11,0.1)', chipText: '#b45309' },
  certification: { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.16)', text: '#047857', chipBg: 'rgba(16,185,129,0.1)', chipText: '#047857' },
};

const RESULT_COLORS = ['#1d4ed8', '#7c3aed', '#0ea5e9', '#10b981'];

function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

const EnterpriseSolutions: React.FC<EnterpriseSolutionsProps> = ({
  solutions,
  clientLogos,
  caseStudies,
  onContactClick,
  onDemoClick,
}) => {
  const fortune500Clients = clientLogos.filter((client) => client.category === 'fortune500');
  const publicCaseStudies = caseStudies.filter((study) => study.isPublic);

  return (
    <div style={{ background: '#f1f5f9' }}>
      {/* ═══════════════ HERO — SaaS dashboard split layout ═══════════════ */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(160deg,#f8fafc 0%,#eef2ff 60%,#f1f5f9 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-14 lg:pt-24 lg:pb-20">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            {/* Left — copy */}
            <div className="lg:col-span-7">
              <span
                className="inline-flex items-center gap-2 text-[11px] font-bold px-3 py-1.5 rounded-full mb-6"
                style={{ background: 'rgba(29,78,216,0.1)', color: '#1d4ed8' }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#1d4ed8' }} />
                ENTERPRISE LEARNING SOLUTIONS
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-5" style={{ color: '#0f172a', letterSpacing: '-0.02em' }}>
                Transform your workforce with
                <span className="block" style={{ background: 'linear-gradient(90deg,#1d4ed8,#0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  data-driven training programs
                </span>
              </h1>
              <p className="text-lg mb-8 max-w-xl" style={{ color: '#475569' }}>
                Empower your teams with industry-leading learning experiences designed for Fortune 500 companies.
                Track outcomes, measure ROI, and build the skills that drive competitive advantage.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onDemoClick}
                  className="inline-flex items-center justify-center gap-2 text-white font-bold text-sm px-7 py-3.5 rounded-xl transition-transform hover:scale-[1.03]"
                  style={{ background: 'linear-gradient(90deg,#1d4ed8,#0ea5e9)', boxShadow: '0 12px 24px -8px rgba(29,78,216,0.4)' }}
                >
                  Schedule a Demo
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </button>
                <button
                  onClick={onContactClick}
                  className="inline-flex items-center justify-center gap-2 font-bold text-sm px-7 py-3.5 rounded-xl bg-white border transition-colors hover:bg-slate-50"
                  style={{ color: '#0f172a', borderColor: '#e2e8f0' }}
                >
                  Contact Sales
                </button>
              </div>

              <div className="flex items-center gap-3 mt-8">
                <div className="flex -space-x-2">
                  {fortune500Clients.slice(0, 5).map((client) => (
                    <div key={client.id} className="w-8 h-8 rounded-full bg-white border-2 border-white flex items-center justify-center overflow-hidden shadow-sm">
                      <OptimizedImage src={client.logoUrl} alt={client.name} width={20} height={20} className="w-4 h-4 object-contain" />
                    </div>
                  ))}
                </div>
                <p className="text-xs font-semibold" style={{ color: '#64748b' }}>
                  Trusted by 500+ enterprise teams worldwide
                </p>
              </div>
            </div>

            {/* Right — dashboard mockup card */}
            <div className="lg:col-span-5">
              <div
                className="rounded-3xl bg-white overflow-hidden"
                style={{ border: '1px solid #e2e8f0', boxShadow: '0 30px 60px -20px rgba(15,23,42,0.2)' }}
              >
                {/* fake window chrome */}
                <div className="flex items-center gap-1.5 px-4 py-3 border-b" style={{ borderColor: '#f1f5f9' }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#f87171' }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#fbbf24' }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#34d399' }} />
                  <span className="ml-3 text-[11px] font-semibold" style={{ color: '#94a3b8' }}>
                    Learning Hub+ · Workforce Analytics
                  </span>
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="rounded-2xl p-4" style={{ background: 'rgba(29,78,216,0.06)', border: '1px solid rgba(29,78,216,0.12)' }}>
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#1d4ed8' }}>Companies trained</p>
                      <p className="text-2xl font-extrabold" style={{ color: '#0f172a' }}>500+</p>
                      <p className="text-[11px] font-semibold mt-1" style={{ color: '#16a34a' }}>▲ 24% YoY</p>
                    </div>
                    <div className="rounded-2xl p-4" style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.12)' }}>
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#7c3aed' }}>Learners upskilled</p>
                      <p className="text-2xl font-extrabold" style={{ color: '#0f172a' }}>250K+</p>
                      <p className="text-[11px] font-semibold mt-1" style={{ color: '#16a34a' }}>▲ 38% YoY</p>
                    </div>
                    <div className="rounded-2xl p-4" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)' }}>
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#b45309' }}>Avg. satisfaction</p>
                      <p className="text-2xl font-extrabold" style={{ color: '#0f172a' }}>4.9/5</p>
                      <p className="text-[11px] font-semibold mt-1" style={{ color: '#64748b' }}>2,400+ reviews</p>
                    </div>
                    <div className="rounded-2xl p-4" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)' }}>
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#047857' }}>ROI increase</p>
                      <p className="text-2xl font-extrabold" style={{ color: '#0f172a' }}>3.2x</p>
                      <p className="text-[11px] font-semibold mt-1" style={{ color: '#16a34a' }}>▲ within 12mo</p>
                    </div>
                  </div>

                  {/* mini bar chart */}
                  <div className="rounded-2xl p-4" style={{ background: '#f8fafc', border: '1px solid #eef2f7' }}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[11px] font-bold" style={{ color: '#334155' }}>Skill completion rate</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.12)', color: '#047857' }}>+12%</span>
                    </div>
                    <div className="flex items-end gap-2 h-16">
                      {[45, 62, 55, 78, 70, 88, 95].map((h, i) => (
                        <div key={i} className="flex-1 rounded-md" style={{ height: `${h}%`, background: i === 6 ? 'linear-gradient(180deg,#1d4ed8,#0ea5e9)' : '#dbeafe' }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ TRUSTED BY LOGOS ═══════════════ */}
      {fortune500Clients.length > 0 && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-white p-8" style={{ border: '1px solid #e2e8f0' }}>
              <p className="text-center text-xs font-bold uppercase tracking-widest mb-8" style={{ color: '#94a3b8' }}>
                Trusted by industry leaders
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8 items-center">
                {fortune500Clients.slice(0, 8).map((client) => (
                  <div key={client.id} className="flex items-center justify-center grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300">
                    <OptimizedImage src={client.logoUrl} alt={`${client.name} logo`} width={100} height={40} className="max-h-8 w-auto object-contain" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════ SOLUTIONS — module / app cards ═══════════════ */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#1d4ed8' }}>Solutions</span>
              <h2 className="text-3xl lg:text-4xl font-extrabold mt-2" style={{ color: '#0f172a', letterSpacing: '-0.02em' }}>
                Comprehensive learning modules
              </h2>
            </div>
            <p className="text-sm max-w-md" style={{ color: '#64748b' }}>
              From custom training programs to enterprise platform access — scalable solutions built for your organization&rsquo;s needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {solutions.map((solution) => {
              const style = CATEGORY_STYLE[solution.category] ?? CATEGORY_STYLE.training;
              return (
                <div
                  key={solution.id}
                  className="group relative flex flex-col bg-white rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1"
                  style={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(15,23,42,0.05)' }}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"
                    style={{ background: 'linear-gradient(90deg,#1d4ed8,#0ea5e9)' }}
                  />
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: style.bg, border: `1px solid ${style.border}` }}>
                      {solution.icon}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full" style={{ background: style.chipBg, color: style.chipText }}>
                      {solution.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold mb-2" style={{ color: '#0f172a' }}>{solution.title}</h3>
                  <p className="text-sm leading-relaxed mb-5" style={{ color: '#64748b' }}>{solution.description}</p>

                  <ul className="space-y-2.5 mb-6 flex-1">
                    {solution.features.slice(0, 4).map((feature, index) => (
                      <li key={index} className="flex items-start gap-2.5">
                        <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="#10b981" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-xs font-medium" style={{ color: '#475569' }}>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center justify-between pt-5 mt-auto" style={{ borderTop: '1px solid #f1f5f9' }}>
                    {solution.pricing ? (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#94a3b8' }}>Starting at</p>
                        <p className="text-sm font-extrabold" style={{ color: '#0f172a' }}>{solution.pricing}</p>
                      </div>
                    ) : <span />}
                    <button
                      onClick={onContactClick}
                      className="inline-flex items-center gap-1 text-xs font-bold px-4 py-2.5 rounded-xl transition-transform group-hover:scale-105"
                      style={{ background: 'linear-gradient(90deg,#1d4ed8,#0ea5e9)', color: '#fff' }}
                    >
                      Learn More
                      <svg width="12" height="12" fill="none" stroke="white" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ CASE STUDIES — dashboard report cards ═══════════════ */}
      {publicCaseStudies.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#1d4ed8' }}>Success stories</span>
              <h2 className="text-3xl lg:text-4xl font-extrabold mt-2" style={{ color: '#0f172a', letterSpacing: '-0.02em' }}>
                Real results from real teams
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {publicCaseStudies.slice(0, 3).map((caseStudy) => (
                <div key={caseStudy.id} className="flex flex-col bg-white rounded-3xl p-6" style={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(15,23,42,0.05)' }}>
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-xs font-extrabold text-white flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg,#1d4ed8,#0ea5e9)' }}
                    >
                      {initials(caseStudy.companyName)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm truncate" style={{ color: '#0f172a' }}>{caseStudy.companyName}</h3>
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full mt-1" style={{ background: '#f1f5f9', color: '#64748b' }}>
                        {caseStudy.industry}
                      </span>
                    </div>
                  </div>

                  <div className="mb-5 space-y-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: '#94a3b8' }}>Challenge</p>
                      <p className="text-xs leading-relaxed line-clamp-3" style={{ color: '#64748b' }}>{caseStudy.challenge}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: '#94a3b8' }}>Solution</p>
                      <p className="text-xs leading-relaxed line-clamp-3" style={{ color: '#64748b' }}>{caseStudy.solution}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-5 mt-auto" style={{ borderTop: '1px solid #f1f5f9' }}>
                    {caseStudy.results.slice(0, 4).map((result, index) => (
                      <div key={index} className="rounded-xl px-2.5 py-2.5 text-center" style={{ background: '#f8fafc' }}>
                        <div className="text-lg font-extrabold" style={{ color: RESULT_COLORS[index % RESULT_COLORS.length] }}>{result.value}</div>
                        <div className="text-[10px] font-semibold leading-tight mt-0.5" style={{ color: '#64748b' }}>{result.metric}</div>
                      </div>
                    ))}
                  </div>

                  {caseStudy.testimonial && (
                    <div className="mt-5 pt-5 rounded-2xl p-4" style={{ background: 'rgba(29,78,216,0.04)', borderLeft: '3px solid #1d4ed8' }}>
                      <p className="text-xs italic leading-relaxed mb-2" style={{ color: '#475569' }}>&ldquo;{caseStudy.testimonial.quote}&rdquo;</p>
                      <p className="text-[11px] font-bold" style={{ color: '#0f172a' }}>{caseStudy.testimonial.author}</p>
                      <p className="text-[11px]" style={{ color: '#94a3b8' }}>{caseStudy.testimonial.title}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════ LEARNING HUB+ — feature widget panel ═══════════════ */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="relative overflow-hidden rounded-3xl p-10 lg:p-14"
            style={{ background: 'linear-gradient(160deg,#080f1e 0%,#0f1e3c 50%,#0f172a 100%)' }}
          >
            <div className="max-w-3xl mx-auto text-center">
              <span className="inline-flex items-center gap-2 text-[11px] font-bold px-3 py-1.5 rounded-full mb-6"
                style={{ background: 'rgba(56,189,248,0.15)', color: '#7dd3fc' }}>
                LEARNING HUB+ PLATFORM
              </span>
              <h2 className="text-3xl lg:text-4xl font-extrabold mb-5" style={{ color: '#f1f5f9', letterSpacing: '-0.02em' }}>
                Your enterprise learning command center
              </h2>
              <p className="text-base mb-10" style={{ color: '#94a3b8' }}>
                Our premium platform for large-scale workforce development. Advanced analytics, custom learning
                paths, and dedicated support — all in one dashboard.
              </p>

              <div className="grid sm:grid-cols-3 gap-4 mb-10 text-left">
                <div className="rounded-2xl p-5" style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.15)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-4" style={{ background: 'rgba(56,189,248,0.15)' }}>📊</div>
                  <h3 className="font-bold text-sm mb-1.5" style={{ color: '#f1f5f9' }}>Advanced Analytics</h3>
                  <p className="text-xs leading-relaxed" style={{ color: '#94a3b8' }}>Track progress, measure ROI, and optimize learning outcomes in real time.</p>
                </div>
                <div className="rounded-2xl p-5" style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.15)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-4" style={{ background: 'rgba(167,139,250,0.15)' }}>🎯</div>
                  <h3 className="font-bold text-sm mb-1.5" style={{ color: '#f1f5f9' }}>Custom Learning Paths</h3>
                  <p className="text-xs leading-relaxed" style={{ color: '#94a3b8' }}>Tailored curricula aligned with your business objectives.</p>
                </div>
                <div className="rounded-2xl p-5" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-4" style={{ background: 'rgba(52,211,153,0.15)' }}>🤝</div>
                  <h3 className="font-bold text-sm mb-1.5" style={{ color: '#f1f5f9' }}>Dedicated Support</h3>
                  <p className="text-xs leading-relaxed" style={{ color: '#94a3b8' }}>24/7 customer success team and technical support.</p>
                </div>
              </div>

              <button
                onClick={onDemoClick}
                className="inline-flex items-center gap-2 text-sm font-bold px-8 py-3.5 rounded-xl text-white transition-transform hover:scale-105"
                style={{ background: 'linear-gradient(90deg,#1d4ed8,#0ea5e9)' }}
              >
                Request Learning Hub+ Demo
                <svg width="14" height="14" fill="none" stroke="white" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ FINAL CTA ═══════════════ */}
      <section className="pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-white text-center p-10 lg:p-14" style={{ border: '1px solid #e2e8f0', boxShadow: '0 20px 45px -20px rgba(15,23,42,0.15)' }}>
            <h2 className="text-2xl lg:text-3xl font-extrabold mb-4" style={{ color: '#0f172a', letterSpacing: '-0.02em' }}>
              Ready to transform your workforce?
            </h2>
            <p className="text-sm mb-8 max-w-xl mx-auto" style={{ color: '#64748b' }}>
              Join thousands of companies that have already invested in their team&rsquo;s future. Let&rsquo;s discuss
              how we can help you achieve your learning and development goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={onContactClick}
                className="inline-flex items-center justify-center gap-2 text-white font-bold text-sm px-7 py-3.5 rounded-xl transition-transform hover:scale-105"
                style={{ background: 'linear-gradient(90deg,#1d4ed8,#0ea5e9)', boxShadow: '0 12px 24px -8px rgba(29,78,216,0.35)' }}
              >
                Contact Our Team
              </button>
              <button
                onClick={onDemoClick}
                className="inline-flex items-center justify-center gap-2 font-bold text-sm px-7 py-3.5 rounded-xl bg-white border transition-colors hover:bg-slate-50"
                style={{ color: '#0f172a', borderColor: '#e2e8f0' }}
              >
                Schedule a Demo
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EnterpriseSolutions;
