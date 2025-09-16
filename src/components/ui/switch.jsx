import React from 'react'

export function Switch({ checked=false, onCheckedChange }){
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={()=>onCheckedChange && onCheckedChange(!checked)}
      className={`inline-flex h-6 w-10 items-center rounded-full transition ${checked ? 'bg-black' : 'bg-gray-300'}`}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${checked ? 'translate-x-4' : 'translate-x-1'}`}></span>
    </button>
  )
}