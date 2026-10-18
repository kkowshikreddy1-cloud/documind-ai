import React, { useId } from 'react';

interface LogoMarkProps {
  className?: string;
  /** Accessible name. Leave out when the logo sits next to the product name. */
  title?: string;
}

/**
 * The DocuMind AI mark: a report page with one highlighted line, the same
 * "show the evidence" gesture the product is built around.
 * Keep in sync with public/favicon.svg.
 */
export const LogoMark: React.FC<LogoMarkProps> = ({ className, title }) => {
  const gradientId = `dm-grad-${useId().replace(/:/g, '')}`;

  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <linearGradient id={gradientId} x1="6" y1="2" x2="58" y2="62" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4f46e5" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="15" fill={`url(#${gradientId})`} />
      <path d="M19 11h19.5L50 22.5V50a4 4 0 0 1-4 4H19a4 4 0 0 1-4-4V15a4 4 0 0 1 4-4Z" fill="#fff" />
      <path d="M38.5 11v8.5a3 3 0 0 0 3 3H50L38.5 11Z" fill="#c7d2fe" />
      <rect x="21" y="26" width="16" height="3" rx="1.5" fill="#a5b4fc" />
      <rect x="19" y="33" width="27" height="8" rx="2" fill="#fde047" />
      <rect x="21" y="35.5" width="20" height="3" rx="1.5" fill="#3730a3" />
      <rect x="21" y="46" width="12" height="3" rx="1.5" fill="#a5b4fc" />
    </svg>
  );
};
