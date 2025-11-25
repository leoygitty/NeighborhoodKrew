
import * as React from 'react';
export const Card = ({ className='', ...props }: any) => <div className={`rounded-2xl border bg-white ${className}`} {...props}/>;
export const CardHeader = ({ className='', ...props }: any) => <div className={`p-4 border-b ${className}`} {...props}/>;
export const CardTitle = ({ className='', ...props }: any) => <h3 className={`font-semibold ${className}`} {...props}/>;
export const CardContent = ({ className='', ...props }: any) => <div className={`p-4 ${className}`} {...props}/>;
export default Card;
