
import * as React from 'react';
export const Input = ({ className='', ...props }: any) => <input className={`border rounded-md px-3 py-2 w-full ${className}`} {...props}/>;
export default Input;
