'use client';

import { focusUtils } from '@/lib/accessibility-utils';

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export default function SkipLink({ href, children, className = '' }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={`${focusUtils.classes.skipLink} ${className}`}
      onClick={(e) => {
        e.preventDefault();
        const target = document.querySelector(href) as HTMLElement;
        if (target) {
          target.focus();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }}
    >
      {children}
    </a>
  );
}