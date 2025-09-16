import React from 'react'
import { cn } from '@/lib/utils'

export const Input = React.forwardRef(function Input({ className='', ...props }, ref){
  return <input ref={ref} className={cn('w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black', className)} {...props} />
})