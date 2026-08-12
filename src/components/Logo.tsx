import { Link } from 'react-router-dom';
import { brand } from '@/data/brand';

interface LogoProps {
  className?: string;
  imgClassName?: string;
}

export function Logo({ className = '', imgClassName = 'h-10 w-auto object-contain' }: LogoProps) {
  return (
    <Link to="/" className={`inline-flex items-center shrink-0 ${className}`} aria-label={`${brand.name} home`}>
      <img
        src="/logo.png"
        alt="KAWAD SWAD"
        className={imgClassName}
      />
    </Link>
  );
}
