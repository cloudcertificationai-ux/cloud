'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

interface ChatMessage { id: number; text: string; time: string; isMe: boolean; }
interface ChatScreen { id: number; contactName: string; contactInitial: string; messages: ChatMessage[]; }

const chatScreens: ChatScreen[] = [
  {
    id: 1, contactName: 'Bilaal Usa (SAP)', contactInitial: 'B',
    messages: [
      { id: 1, text: 'Hi - Hope u are doing well 😊', time: '7:00 am', isMe: false },
      { id: 2, text: "How's your session going on ??", time: '7:00 am', isMe: false },
      { id: 3, text: 'keep me posted feedback please', time: '7:01 am', isMe: false },
      { id: 4, text: 'Hi Bhavesh. Its fine so far. We usually spend more time with session and questions which is good.', time: '7:05 am', isMe: true },
      { id: 5, text: 'I just want to know, for the exam, are you going to help me the preparation or is the instructor?', time: '7:06 am', isMe: true },
      { id: 6, text: 'Trainer will help 👍', time: '7:48 am', isMe: false },
      { id: 7, text: 'Can we do a call after the class?', time: '7:50 am', isMe: true },
    ],
  },
  {
    id: 2, contactName: 'Training Support', contactInitial: 'T',
    messages: [
      { id: 1, text: 'Good morning! Ready for today\'s session?', time: '8:30 am', isMe: false },
      { id: 2, text: 'Yes, absolutely! Looking forward to it.', time: '8:31 am', isMe: true },
      { id: 3, text: 'We will cover advanced SAP modules today', time: '8:32 am', isMe: false },
      { id: 4, text: 'Great! I have prepared my notes', time: '8:35 am', isMe: true },
      { id: 5, text: 'Trainer will help with exam prep too 👍', time: '8:45 am', isMe: false },
    ],
  },
  {
    id: 3, contactName: 'SAP Batch Group', contactInitial: 'S',
    messages: [
      { id: 1, text: 'Congratulations everyone on completing Module 3! 🎉', time: '6:00 pm', isMe: false },
      { id: 2, text: 'Thank you! The trainer was amazing', time: '6:05 pm', isMe: true },
      { id: 3, text: 'Next session is tomorrow at 9 AM', time: '6:10 pm', isMe: false },
      { id: 4, text: 'Please review the materials shared earlier', time: '6:11 pm', isMe: false },
      { id: 5, text: 'Will do! Thanks for the reminder 😊', time: '6:15 pm', isMe: true },
    ],
  },
  {
    id: 4, contactName: 'Career Mentor', contactInitial: 'C',
    messages: [
      { id: 1, text: 'How is your job search going?', time: '2:00 pm', isMe: false },
      { id: 2, text: 'Got 2 interviews lined up this week!', time: '2:05 pm', isMe: true },
      { id: 3, text: 'That\'s fantastic! Which companies?', time: '2:06 pm', isMe: false },
      { id: 4, text: 'One Fortune 500 and a startup 🚀', time: '2:08 pm', isMe: true },
      { id: 5, text: 'Your SAP certification really helped!', time: '2:10 pm', isMe: false },
    ],
  },
  {
    id: 5, contactName: 'Placement Team', contactInitial: 'P',
    messages: [
      { id: 1, text: 'Congratulations! You got the offer! 🎊', time: '11:00 am', isMe: false },
      { id: 2, text: 'Oh wow! I can\'t believe it! Thank you!!', time: '11:02 am', isMe: true },
      { id: 3, text: 'Your hard work paid off 💪', time: '11:03 am', isMe: false },
      { id: 4, text: 'The training was worth every minute', time: '11:05 am', isMe: true },
      { id: 5, text: 'We are so proud of you! Best of luck!', time: '11:06 am', isMe: false },
    ],
  },
];

// Single phone mockup — fixed small size so it fits inside the center column
function PhoneCard({ chat }: { chat: ChatScreen }) {
  const W = 140, H = 280;
  return (
    <div style={{ width: W, height: H, borderRadius: 22, background: 'linear-gradient(160deg,#2c2c2c,#1a1a1a)', boxShadow: '0 16px 40px rgba(0,0,0,0.55)', position: 'relative', flexShrink: 0 }}>
      {/* screen */}
      <div style={{ position: 'absolute', top: 7, left: 5, right: 5, bottom: 7, borderRadius: 17, overflow: 'hidden', background: '#ECE5DD', display: 'flex', flexDirection: 'column' }}>
        {/* status bar */}
        <div style={{ background: '#075E54', padding: '2px 6px', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'white', fontSize: 6 }}>9:41</span>
          <span style={{ color: 'white', fontSize: 6 }}>●●●</span>
        </div>
        {/* header */}
        <div style={{ background: '#075E54', padding: '3px 6px 5px', display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 8, fontWeight: 700, flexShrink: 0 }}>{chat.contactInitial}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: 'white', fontSize: 7, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chat.contactName}</div>
            <div style={{ color: '#a8e6b8', fontSize: 6 }}>online</div>
          </div>
        </div>
        {/* date chip */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3px 0' }}>
          <span style={{ background: 'rgba(255,255,255,0.7)', color: '#666', fontSize: 6, padding: '1px 5px', borderRadius: 6 }}>Thursday</span>
        </div>
        {/* messages */}
        <div style={{ flex: 1, overflow: 'hidden', padding: '0 5px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {chat.messages.slice(0, 6).map(msg => (
            <div key={msg.id} style={{ display: 'flex', justifyContent: msg.isMe ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '80%', background: msg.isMe ? '#DCF8C6' : '#fff', borderRadius: msg.isMe ? '7px 7px 2px 7px' : '7px 7px 7px 2px', padding: '2px 4px', boxShadow: '0 1px 1px rgba(0,0,0,0.08)' }}>
                <p style={{ fontSize: 6, color: '#303030', lineHeight: 1.3, margin: 0 }}>{msg.text}</p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 2, marginTop: 1 }}>
                  <span style={{ fontSize: 5, color: '#999' }}>{msg.time}</span>
                  {msg.isMe && <span style={{ fontSize: 6, color: '#4FC3F7' }}>✓✓</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* input */}
        <div style={{ background: '#F0F0F0', padding: '3px 5px', display: 'flex', alignItems: 'center', gap: 3 }}>
          <div style={{ flex: 1, background: 'white', borderRadius: 10, padding: '2px 6px' }}><span style={{ fontSize: 6, color: '#aaa' }}>Message</span></div>
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="8" height="8" fill="white" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </div>
        </div>
      </div>
      {/* notch */}
      <div style={{ position: 'absolute', top: 9, left: '50%', transform: 'translateX(-50%)', width: 38, height: 6, background: '#111', borderRadius: 3 }} />
      {/* home bar */}
      <div style={{ position: 'absolute', bottom: 9, left: '50%', transform: 'translateX(-50%)', width: 30, height: 2, background: '#444', borderRadius: 2 }} />
    </div>
  );
}

// Center carousel — phones fan out within a fixed-width container
function PhoneCarousel() {
  const [active, setActive] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const delta = useRef(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = chatScreens.length;

  const next = useCallback(() => setActive(i => (i + 1) % total), [total]);
  const prev = useCallback(() => setActive(i => (i - 1 + total) % total), [total]);

  const startAuto = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(next, 3000);
  }, [next]);
  const stopAuto = useCallback(() => { if (timer.current) clearInterval(timer.current); }, []);

  useEffect(() => { startAuto(); return stopAuto; }, [startAuto, stopAuto]);

  const stageRef = useRef<HTMLDivElement>(null);

  // Passive touch listeners so they never block page scroll
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ts = (e: TouchEvent) => { startX.current = e.touches[0].clientX; delta.current = 0; stopAuto(); };
    const tm = (e: TouchEvent) => { delta.current = e.touches[0].clientX - startX.current; };
    const te = () => { if (delta.current < -40) next(); else if (delta.current > 40) prev(); startAuto(); };
    el.addEventListener('touchstart', ts, { passive: true });
    el.addEventListener('touchmove', tm, { passive: true });
    el.addEventListener('touchend', te, { passive: true });
    return () => { el.removeEventListener('touchstart', ts); el.removeEventListener('touchmove', tm); el.removeEventListener('touchend', te); };
  }, [next, prev, startAuto, stopAuto]);

  const onMD = (e: React.MouseEvent) => { setDragging(true); startX.current = e.clientX; delta.current = 0; stopAuto(); };
  const onMM = (e: React.MouseEvent) => { if (dragging) delta.current = e.clientX - startX.current; };
  const onMU = () => { if (!dragging) return; setDragging(false); if (delta.current < -40) next(); else if (delta.current > 40) prev(); startAuto(); };

  // Each phone slot: center=0, sides=±1,±2
  // Container is 340px wide, phones are 140px wide
  const getStyle = (idx: number) => {
    const diff = ((idx - active) % total + total) % total;
    const d = diff > total / 2 ? diff - total : diff;
    const a = Math.abs(d);
    const s = d >= 0 ? 1 : -1;
    // tx offsets keep phones inside ~340px container
    const map: Record<number, { tx: number; scale: number; opacity: number; z: number; ry: number }> = {
      0: { tx: 0,   scale: 1,    opacity: 1,    z: 20, ry: 0   },
      1: { tx: 100, scale: 0.78, opacity: 0.85, z: 15, ry: -20 },
      2: { tx: 175, scale: 0.58, opacity: 0.6,  z: 10, ry: -35 },
    };
    const c = map[a] ?? { tx: 240, scale: 0.4, opacity: 0, z: 1, ry: -45 };
    return {
      position: 'absolute' as const,
      transform: `translateX(${c.tx * s}px) rotateY(${c.ry * s}deg) scale(${c.scale})`,
      opacity: c.opacity,
      zIndex: c.z,
      transition: 'all 0.5s cubic-bezier(0.25,0.46,0.45,0.94)',
    };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* fixed-size stage — phones stay inside this box */}
      <div
        ref={stageRef}
        style={{ width: 340, height: 380, position: 'relative', perspective: 800, cursor: dragging ? 'grabbing' : 'grab', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onMouseDown={onMD} onMouseMove={onMM} onMouseUp={onMU} onMouseLeave={onMU}
      >
        {chatScreens.map((chat, i) => (
          <div key={chat.id} style={getStyle(i)}>
            <PhoneCard chat={chat} />
          </div>
        ))}
      </div>

    </div>
  );
}

// Left column
function SuccessMantra() {
  const items = [
    { emoji: '🤝', color: '#E8F4FD', title: 'Commitment',    desc: 'Ensuring quality training every day' },
    { emoji: '🎯', color: '#FFF0E8', title: 'Fulfillment',   desc: 'Meeting learning goals with confidence' },
    { emoji: '🏆', color: '#F0E8FF', title: 'Accomplishment', desc: 'Students achieving industry-ready expertise' },
  ];
  return (
    <div>
      <h2 style={{ color: 'white', fontSize: 20, fontWeight: 700, lineHeight: 1.2, marginBottom: 14, marginTop: 0 }}>Our Success<br />Mantra</h2>
      {items.map(item => (
        <div key={item.title} style={{ background: 'white', borderRadius: 12, padding: '10px 12px', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{item.emoji}</div>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a' }}>{item.title}</span>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: '#555', paddingLeft: 40 }}>• {item.desc}</p>
        </div>
      ))}
    </div>
  );
}

// Right column
function BeyondCourses() {
  const features = [
    { label: '24/7\nSupport',          icon: <svg width="26" height="26" fill="none" stroke="#8B1A1A" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
    { label: 'LinkedIn\nProfile',       icon: <svg width="26" height="26" fill="#0A66C2" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
    { label: 'Resume\nWriting',         icon: <svg width="26" height="26" fill="none" stroke="#8B1A1A" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
    { label: 'Alumni\nSessions',        icon: <svg width="26" height="26" fill="none" stroke="#8B1A1A" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { label: 'Interview\nPreparation',  icon: <svg width="26" height="26" fill="none" stroke="#8B1A1A" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg> },
    { label: 'Live\nProjects',          icon: <svg width="26" height="26" fill="none" stroke="#8B1A1A" strokeWidth="2" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> },
  ];
  return (
    <div>
      <h2 style={{ color: 'white', fontSize: 20, fontWeight: 700, marginBottom: 2, marginTop: 0 }}>Beyond Courses:</h2>
      <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginBottom: 14, marginTop: 0 }}>Additional Support We Provide</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {features.map(f => (
          <div key={f.label}
            style={{ background: 'white', borderRadius: 10, padding: '12px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', transition: 'transform 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-3px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
            {f.icon}
            <span style={{ fontSize: 10, fontWeight: 600, color: '#1a1a1a', textAlign: 'center', whiteSpace: 'pre-line', lineHeight: 1.3 }}>{f.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Watermark
function Watermark() {
  const words = [
    { text: 'TOWNS', top: '5%',  left: '2%',  size: 48, rot: -15 },
    { text: 'SAP',   top: '8%',  left: '38%', size: 36, rot: 0   },
    { text: 'workday', top: '60%', left: '72%', size: 32, rot: -10 },
    { text: 'TOWNS', top: '65%', left: '0%',  size: 44, rot: -15 },
    { text: 'SAP',   top: '10%', left: '78%', size: 40, rot: 5   },
    { text: 'N',     top: '40%', left: '88%', size: 60, rot: 0   },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', opacity: 0.13 }}>
      {words.map((w, i) => (
        <span key={i} style={{ position: 'absolute', color: 'white', fontSize: w.size, fontWeight: 900, top: w.top, left: w.left, transform: `rotate(${w.rot}deg)`, whiteSpace: 'nowrap' }}>{w.text}</span>
      ))}
    </div>
  );
}

// Main export
export default function WhatsAppCarousel() {
  return (
    <section style={{ background: 'linear-gradient(135deg,#1a56db 0%,#1e40af 45%,#1e3a8a 100%)', position: 'relative', overflow: 'clip', padding: '72px 0' }}>
      <Watermark />
      <div style={{
        maxWidth: 1100, margin: '0 auto', padding: '0 32px',
        display: 'grid', gridTemplateColumns: '280px 1fr 280px',
        gap: 24, alignItems: 'center', position: 'relative', zIndex: 1,
      }}>
        <SuccessMantra />
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <PhoneCarousel />
        </div>
        <BeyondCourses />
      </div>
    </section>
  );
}
