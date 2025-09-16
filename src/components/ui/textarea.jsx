import React from 'react'
import { cn } from '@/lib/utils'

export const Textarea = React.forwardRef(function Textarea({ className='', ...props }, ref){
  return <textarea ref={ref} className={cn('w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black', className)} {...props} />
})