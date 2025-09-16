import React from 'react'
import { cn } from '@/lib/utils'

export const Button = React.forwardRef(function Button(
  { className='', variant='default', ...props },
  ref
){
  const base = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';
  const variants = {
    default: 'bg-black text-white hover:bg-black/90',
    outline: 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50',
    ghost: 'bg-transparent hover:bg-black/5 text-gray-900',
  }
  return <button ref={ref} className={cn(base, variants[variant] || variants.default, 'px-4 py-2', className)} {...props} />
})