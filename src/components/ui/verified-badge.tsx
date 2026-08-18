import { Check } from 'lucide-react';

interface VerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function VerifiedBadge({ size = 'md', className = '' }: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 text-[9px]',
    md: 'h-5 w-5 text-[10px]',
    lg: 'h-6 w-6 text-[12px]',
  };

  const iconSizes = {
    sm: 'h-2.5 w-2.5',
    md: 'h-3 w-3',
    lg: 'h-3.5 w-3.5',
  };

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-[#0095f6] text-white shadow-sm ring-1 ring-white ${sizeClasses[size]} ${className}`}
      title="Verified Vendor Studio (Official Blue Badge)"
    >
      <Check className={`${iconSizes[size]} stroke-[3.5]`} />
    </span>
  );
}

// Re-export for backwards compatibility
export { VerifiedBadge as InstagramBadge };
