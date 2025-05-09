import clsx from 'clsx';
import Link from 'next/link';
import React, { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react';

type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'outline' | 'plain';
  size?: 'large' | 'medium' | 'small';
  fill?: boolean;
  inactive?: boolean;
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
  label?: string;
  to?: string;
  form?: string;
  children: ReactNode;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'type'>;

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  fill = false,
  inactive = false,
  type = 'button',
  label = 'button',
  to = '',
  form = '',
  children,
  className,
  ...props
}) => {
  const buttonClasses = clsx(
    'flex items-center cursor-pointer gap-1.5 rounded-full justify-center transition ease-out duration-200 active:scale-[0.99] hover:opacity-90',
    variant === 'primary' && 'bg-[#2C2D30] text-[#FFFFFF]',
    variant === 'secondary' && 'bg-neutral-400 text-neutral-900',
    variant === 'outline' && 'border border-neutral-300 text-neutral-900 hover:opacity-100!',
    variant === 'plain' && 'text-neutral-900',
    size === 'large' && 'px-6 py-3 rounded-[16px]! gap-2 font-medium leading-[24px]',
    size === 'medium' && 'px-4.5 py-2.5 leading-[16px]!',
    size === 'small' && 'px-3.5 py-2 text-[14px]! leading-[16px]!',
    fill && 'w-full',
    inactive && 'opacity-50 cursor-not-allowed!',
    className
  );

  return to ? (
    <Link aria-label={label} href={to} className={buttonClasses} {...props}>
      {children}
    </Link>
  ) : (
    <button form={form} aria-label={label} type={type} className={buttonClasses} disabled={inactive} {...props}>
      {children}
    </button>
  );
};

export default Button;
