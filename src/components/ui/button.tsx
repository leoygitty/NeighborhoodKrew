import * as React from 'react'
import { cn } from '@/lib/cn'
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost'
}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const base = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none px-4 py-2';
    const styles = {
      default: 'bg-black text-white hover:opacity-90',
      outline: 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50',
      ghost: 'bg-transparent text-gray-900 hover:bg-gray-100',
    }[variant];
    return <button ref={ref} className={cn(base, styles, className)} {...props} />;
  }
);
Button.displayName = 'Button';
