import * as React from 'react';
import { cn } from '@/lib/utils';

const FIELD =
  'w-full rounded-xl border border-input bg-background px-3.5 text-[0.925rem] text-foreground outline-none transition-[border-color,box-shadow] duration-200 ease-out placeholder:text-text-muted focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/25 aria-invalid:border-accent-red aria-invalid:ring-accent-red/15 disabled:opacity-50';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return <input type={type} data-slot="input" className={cn(FIELD, 'h-11', className)} {...props} />;
}

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return <textarea data-slot="textarea" className={cn(FIELD, 'min-h-28 resize-y py-3 leading-relaxed', className)} {...props} />;
}

export { Input, Textarea, FIELD as fieldClassName };
