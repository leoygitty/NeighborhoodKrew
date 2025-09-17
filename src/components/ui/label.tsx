import * as React from 'react'
import { cn } from '@/lib/cn'
export const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ className, ...props }) => (
  <label className={cn('text-sm font-medium text-gray-800', className)} {...props} />
);
