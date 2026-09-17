import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
const variants = cva('button', {
  variants: {
    variant: { primary: 'button-primary', secondary: 'button-secondary', text: 'button-text' },
    size: { default: '', small: 'button-small' },
  },
  defaultVariants: { variant: 'primary', size: 'default' },
});
export function Button({
  asChild = false,
  className,
  variant,
  size,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof variants> & { asChild?: boolean }) {
  const C = asChild ? Slot : 'button';
  return <C className={cn(variants({ variant, size }), className)} {...props} />;
}
