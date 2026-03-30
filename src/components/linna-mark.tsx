import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

type LinnaMarkProps = SVGProps<SVGSVGElement>;

export function LinnaMark({ className, ...props }: LinnaMarkProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn('shrink-0', className)}
      {...props}
    >
      <path
        d="M12 2.25 20.56 8.47 17.29 18.75H6.71L3.44 8.47 12 2.25Z"
        fill="currentColor"
      />
      <path
        d="M12 6.8 16.06 9.75 14.51 14.6H9.49L7.94 9.75 12 6.8Z"
        fill="white"
        fillOpacity="0.2"
      />
      <path
        d="M12 8.9V13"
        stroke="white"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle cx="12" cy="15.55" r="1.1" fill="white" />
    </svg>
  );
}
