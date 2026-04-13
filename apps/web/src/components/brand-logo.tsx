import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  className?: string;
  imageClassName?: string;
  size?: number;
  priority?: boolean;
}

export function BrandLogo({
  className,
  imageClassName,
  size = 40,
  priority = false
}: BrandLogoProps) {
  return (
    <span
      className={cn('relative inline-flex shrink-0 overflow-hidden rounded-2xl', className)}
      style={{ width: size, height: size }}
    >
      <Image
        src='/logo.png'
        alt='Diffmint logo'
        fill
        sizes={`${size}px`}
        priority={priority}
        className={cn('object-cover', imageClassName)}
      />
    </span>
  );
}

interface BrandLinkProps {
  className?: string;
  imageClassName?: string;
  labelClassName?: string;
  href?: string;
  priority?: boolean;
  showLabel?: boolean;
  size?: number;
}

export function BrandLink({
  className,
  imageClassName,
  labelClassName,
  href = '/',
  priority = false,
  showLabel = true,
  size = 40
}: BrandLinkProps) {
  return (
    <Link href={href} className={cn('flex items-center gap-3 font-medium', className)}>
      <BrandLogo size={size} priority={priority} imageClassName={imageClassName} />
      {showLabel ? (
        <span className={cn('text-lg font-semibold', labelClassName)}>Diffmint</span>
      ) : null}
    </Link>
  );
}
