'use client';

import Link from 'next/link';

export default function Footer() {
  const certificationCourses = [
    { href: '/courses/cloud-computing', label: 'Cloud Computing Training Program' },
    { href: '/courses/devops', label: 'DevOps Training Program' },
    { href: '/courses/microsoft-azure', label: 'Microsoft Azure Training Program' },
    { href: '/courses/salesforce', label: 'Salesforce Training Program' },
    { href: '/courses/data-science', label: 'Data Science Training Program' },
    { href: '/courses/data-analytics', label: 'Data Analytics Training Program' },
    { href: '/courses/full-stack', label: 'Full Stack Development Training Program' },
    { href: '/courses/blockchain', label: 'Blockchain Certification Training Program' },
    { href: '/courses/python', label: 'Python Training Program' },
    { href: '/courses/software-testing', label: 'Software Testing With Gen AI Training Program' },
  ];

  const masterCourses = [
    { href: '/masters/cloud-computing', label: 'Master Program in Cloud Computing' },
    { href: '/masters/devops', label: 'Master in DevOps Engineering' },
    { href: '/masters/software-testing', label: 'Master in Software Testing' },
    { href: '/masters/ai', label: 'Masters in Artificial Intelligence' },
    { href: '/masters/data-analytics', label: 'Masters in Data Analytics' },
    { href: '/masters/data-science', label: 'Masters in Data Science Program' },
    { href: '/masters/full-stack', label: 'Masters in Full Stack Development Training' },
    { href: '/masters/generative-ai', label: 'Masters in Generative AI' },
    { href: '/masters/professional-data-analytics', label: 'Professional in Data Analytics' },
    { href: '/masters/professional-data-science', label: 'Professional in Data Science' },
  ];

  const companyLinks = [
    { href: '/about', label: 'About Us' },
    { href: '/reviews', label: 'Reviews' },
    { href: '/contact', label: 'Contact Us' },
    { href: '/blog', label: 'Blog' },
    { href: '/web-stories', label: 'Web Stories' },
    { href: '/faq', label: "FAQ's" },
    { href: '/terms', label: 'Terms & Conditions' },
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/press-release', label: 'Press Release' },
    { href: '/grievance', label: 'Grievance' },
  ];

  const workWithUsLinks = [
    { href: '/service', label: 'Service' },
    { href: '/placement', label: 'Placement' },
    { href: '/career', label: 'Career with Croma Campus' },
    { href: '/clients', label: 'Our Clients' },
    { href: '/corporate-training', label: 'Corporate Training' },
    { href: '/become-instructor', label: 'Become an Instructor' },
    { href: '/hire', label: 'Hire from Croma Campus' },
    { href: '/join-us', label: 'Join Us' },
    { href: '/brochure', label: 'Download Brochure' },
    { href: '/refund', label: 'Refund' },
    { href: '/shipping', label: 'Shipping & Delivery Policy' },
  ];

  return (
    <footer className="bg-gray-900" style={{ color: '#ccc', fontFamily: 'sans-serif' }}>
      {/* Top section: logo + description */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px 20px' }}>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', marginBottom: '40px' }}>
          <div style={{ flexShrink: 0 }}>
            <img
              src="/cloud-certification-logo.png"
              alt="Cloud Certification"
              style={{ width: '120px', height: 'auto' }}
            />
          </div>
          <p style={{ fontSize: '13px', lineHeight: '1.7', color: '#bbb', maxWidth: '700px', margin: 0 }}>
            Croma Campus is an education platform providing rigorous industry-relevant programs designed and delivered in
            collaboration with world-class faculty, industry &amp; Infrastructure. In the past 15 years we have trained
            18000+ candidates and out of which we are able to place 12000+ professionals in various industries successfully.
          </p>
        </div>

        {/* 4-column links grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px', paddingBottom: '40px' }}>
          {/* Trending Certification Courses */}
          <div>
            <h3 style={{ color: '#fff', fontSize: '13px', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '12px', borderBottom: '2px solid #f90', paddingBottom: '8px', display: 'inline-block' }}>
              TRENDING CERTIFICATION COURSES
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {certificationCourses.map((link) => (
                <li key={link.href} style={{ marginBottom: '6px' }}>
                  <Link href={link.href} style={{ color: '#bbb', fontSize: '12px', textDecoration: 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#bbb')}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Trending Master Courses */}
          <div>
            <h3 style={{ color: '#fff', fontSize: '13px', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '12px', borderBottom: '2px solid #f90', paddingBottom: '8px', display: 'inline-block' }}>
              TRENDING MASTER COURSES
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {masterCourses.map((link) => (
                <li key={link.href} style={{ marginBottom: '6px' }}>
                  <Link href={link.href} style={{ color: '#bbb', fontSize: '12px', textDecoration: 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#bbb')}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 style={{ color: '#fff', fontSize: '13px', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '12px', borderBottom: '2px solid #f90', paddingBottom: '8px', display: 'inline-block' }}>
              COMPANY
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {companyLinks.map((link) => (
                <li key={link.href} style={{ marginBottom: '6px' }}>
                  <Link href={link.href} style={{ color: '#bbb', fontSize: '12px', textDecoration: 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#bbb')}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Work With Us */}
          <div>
            <h3 style={{ color: '#fff', fontSize: '13px', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '12px', borderBottom: '2px solid #f90', paddingBottom: '8px', display: 'inline-block' }}>
              WORK WITH US
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {workWithUsLinks.map((link) => (
                <li key={link.href} style={{ marginBottom: '6px' }}>
                  <Link href={link.href} style={{ color: '#bbb', fontSize: '12px', textDecoration: 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#bbb')}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800 bg-gray-900">
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          {/* Follow Us */}
          <div>
            <p style={{ color: '#fff', fontSize: '12px', fontWeight: 700, marginBottom: '10px', letterSpacing: '0.5px' }}>FOLLOW US</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              {/* Facebook */}
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#1877f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" fill="white" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
              </a>
              {/* Instagram */}
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" fill="white" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="white" strokeWidth="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="white" strokeWidth="2"/><circle cx="17.5" cy="6.5" r="1" fill="white"/></svg>
              </a>
              {/* Twitter/X */}
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter"
                style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#1da1f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" fill="white" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
              </a>
              {/* LinkedIn */}
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"
                style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#0077b5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" fill="white" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
              {/* Pinterest */}
              <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" aria-label="Pinterest"
                style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e60023', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" fill="white" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>
              </a>
              {/* YouTube */}
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube"
                style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#ff0000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" fill="white" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#ff0000"/></svg>
              </a>
            </div>
          </div>

          {/* ISO Badge */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#ccc', fontSize: '13px', margin: 0 }}>An ISO 9001:2015 Certified Company</p>
          </div>

          {/* Payment Methods */}
          <div>
            <p style={{ color: '#fff', fontSize: '12px', fontWeight: 700, marginBottom: '10px', letterSpacing: '0.5px' }}>WE ACCEPT ONLINE PAYMENTS</p>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {/* PhonePe */}
              <div style={{ backgroundColor: '#5f259f', borderRadius: '4px', padding: '4px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '40px', height: '28px' }}>
                <span style={{ color: '#fff', fontSize: '11px', fontWeight: 700 }}>Pe</span>
              </div>
              {/* Google Pay */}
              <div style={{ backgroundColor: '#fff', borderRadius: '4px', padding: '4px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '40px', height: '28px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#4285f4' }}>G</span><span style={{ fontSize: '11px', fontWeight: 700, color: '#ea4335' }}>P</span><span style={{ fontSize: '11px', fontWeight: 700, color: '#fbbc05' }}>a</span><span style={{ fontSize: '11px', fontWeight: 700, color: '#34a853' }}>y</span>
              </div>
              {/* Paytm */}
              <div style={{ backgroundColor: '#00baf2', borderRadius: '4px', padding: '4px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '48px', height: '28px' }}>
                <span style={{ color: '#fff', fontSize: '11px', fontWeight: 700 }}>Paytm</span>
              </div>
              {/* Visa */}
              <div style={{ backgroundColor: '#1a1f71', borderRadius: '4px', padding: '4px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '40px', height: '28px' }}>
                <span style={{ color: '#fff', fontSize: '13px', fontWeight: 700, fontStyle: 'italic' }}>VISA</span>
              </div>
              {/* Mastercard */}
              <div style={{ backgroundColor: '#fff', borderRadius: '4px', padding: '4px 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '28px' }}>
                <div style={{ position: 'relative', display: 'flex' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#eb001b' }}></div>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#f79e1b', marginLeft: '-8px', opacity: 0.9 }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
