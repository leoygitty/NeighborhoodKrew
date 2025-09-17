import * as React from 'react'
type Props = { checked?: boolean, onCheckedChange?: (v:boolean)=>void } & React.HTMLAttributes<HTMLButtonElement>
export function Switch({ checked=false, onCheckedChange, ...rest }: Props) {
  return (
    <button
      aria-pressed={checked}
      onClick={()=>onCheckedChange && onCheckedChange(!checked)}
      className={'w-11 h-6 rounded-full transition ' + (checked ? 'bg-black' : 'bg-gray-300')}
      {...rest}
    >
      <span className={'block w-5 h-5 bg-white rounded-full transform transition ' + (checked ? 'translate-x-5' : 'translate-x-1')} />
    </button>
  )
}
