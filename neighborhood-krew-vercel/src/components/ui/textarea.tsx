
import * as React from 'react';
export const Textarea = ({ className='', ...props }: any) => <textarea className={`border rounded-md px-3 py-2 w-full ${className}`} {...props}/>;
export default Textarea;
