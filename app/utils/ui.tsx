import { Link } from '@remix-run/react';
import { cn } from './misc';

type LabelProps = React.ComponentProps<'label'> & {
	htmlFor: string;
};
export function Label(props: LabelProps) {
	return (
		<label
			{...props}
			htmlFor={props.htmlFor}
			className={cn('block text-sm font-medium text-gray-700', props.className)}
		/>
	);
}

type InputProps = React.ComponentProps<'input'> & {
	label: string;
};

export function Input({ label, ...props }: InputProps) {
	return (
		<div className="space-y-1">
			<Label htmlFor={props.id as string}>{label}</Label>
			<input
				{...props}
				className={cn(
					'block w-full px-3 h-9 border border-gray-300 rounded-md shadow-sm sm:text-sm',
					props.className,
				)}
			/>
		</div>
	);
}

type SelectProps = React.ComponentProps<'select'> & {
	label: string;
	options: { value: string; label: string }[];
};
export function Select({ label, options, ...props }: SelectProps) {
	return (
		<div className="space-y-1">
			<Label htmlFor={props.id as string}>{label}</Label>
			<select
				{...props}
				className={cn(
					'block w-full px-3 h-9 bg-white border border-gray-300 rounded-md shadow-sm sm:text-sm',
					props.className,
				)}
			>
				{options.map(option => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
		</div>
	);
}

type ButtonProps = React.ComponentProps<'button'> & {
	variant?: 'primary' | 'outline';
};
export function Button({ variant = 'primary', ...props }: ButtonProps) {
	return (
		<button
			{...props}
			className={cn(
				'px-6 py-2 rounded-md text-base',
				{
					'text-white bg-black hover:bg-black/80': variant === 'primary',
					'text-black border border-black': variant === 'outline',
				},
				props.className,
			)}
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
			className={cn(
				'px-6 py-2 rounded-md text-base',
				{
					'text-white bg-black': variant === 'primary',
					'text-black border border-black': variant === 'outline',
				},
				props.className,
			)}
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

export function ArrowBack(props: React.ComponentProps<'svg'>) {
	return (
		<svg
			width="32"
			height="32"
			viewBox="0 0 32 32"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
			className={cn('transform rotate-90 group-hover:-translate-x-1 transition-all')}
		>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M15.101 5.5V23.1094L9.40108 17.4095L8.14807 18.6619L15.9862 26.5L23.852 18.6342L22.5996 17.3817L16.8725 23.1094V5.5H15.101Z"
				fill="currentColor"
			></path>
		</svg>
	);
}
