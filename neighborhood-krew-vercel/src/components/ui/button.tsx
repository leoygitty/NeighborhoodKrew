
import * as React from 'react';
export const Button = ({ children, className = '', variant='default', style, ...props }: any) => {
  const base = 'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition';
  const variants: any = {
    default: 'bg-black text-white hover:opacity-90',
    outline: 'border bg-white text-black hover:bg-gray-50',
    ghost: 'text-black hover:bg-gray-100'
  };
  return <button className={`${base} ${variants[variant]||variants.default} ${className}`} style={style} {...props}>{children}</button>;
};
export default Button;
