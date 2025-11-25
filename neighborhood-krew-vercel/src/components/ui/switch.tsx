
import * as React from 'react';
export const Switch = ({ checked=false, onCheckedChange }: any) => {
  return (
    <button
      onClick={()=>onCheckedChange && onCheckedChange(!checked)}
      aria-pressed={checked}
      className={`w-11 h-6 rounded-full transition ${checked ? 'bg-black' : 'bg-gray-300'} relative`}
    >
      <span className={`absolute top-0.5 ${checked ? 'left-5' : 'left-0.5'} bg-white w-5 h-5 rounded-full transition`}></span>
    </button>
  );
};
export default Switch;
