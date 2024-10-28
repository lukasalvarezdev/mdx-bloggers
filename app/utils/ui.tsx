import { Link } from '@remix-run/react';
import { cn } from './misc';

type ButtonProps = React.ComponentProps<'button'> & {
	variant?: 'primary' | 'outline';
};
export function Button({ variant = 'primary', ...props }: ButtonProps) {
	return (
		<button
			{...props}
			className={cn('px-6 py-2 rounded-md text-base', {
				'text-white bg-black': variant === 'primary',
				'text-black border border-black': variant === 'outline',
			})}
		/>
	);
}

type LinkButtonProps = React.ComponentProps<typeof Link> & {
	variant?: 'primary' | 'outline';
};
export function LinkButton({ variant = 'primary', ...props }: LinkButtonProps) {
	return (
		<Link
			{...props}
			className={cn('px-6 py-2 rounded-md text-base', {
				'text-white bg-black': variant === 'primary',
				'text-black border border-black': variant === 'outline',
			})}
		/>
	);
}

export function Card(props: React.ComponentProps<'div'>) {
	return (
		<div
			{...props}
			className={cn(
				'bg-white p-6 rounded-lg shadow-sm border border-gray-200',
				props.className,
			)}
		/>
	);
}
