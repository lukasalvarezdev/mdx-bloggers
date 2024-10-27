import { Link } from '@remix-run/react';
import { Code, FileText, GitBranch, Share2 } from 'lucide-react';
import { Card, LinkButton } from '~/utils/ui';

export default function Component() {
	return (
		<div className="flex flex-col min-h-[100dvh]">
			<header className="px-4 lg:px-6 h-14 flex items-center">
				<Link className="flex items-center justify-center" to="#">
					<Code className="h-6 w-6 text-primary" />
					<span className="ml-2 text-2xl font-bold text-primary">MDXBloggers</span>
				</Link>
				<nav className="ml-auto flex gap-4 sm:gap-6">
					<Link
						className="text-sm font-medium hover:underline underline-offset-4"
						to="/sign-up"
					>
						Get Started
					</Link>
					<Link
						className="text-sm font-medium hover:underline underline-offset-4"
						to="#features"
					>
						Features
					</Link>
				</nav>
			</header>

			<main className="flex-1">
				<section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
					<div className="cont px-4 md:px-6">
						<div className="flex flex-col items-center space-y-4 text-center">
							<div className="flex flex-col gap-2">
								<h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
									Blog with the Power of MDX
								</h1>
								<p className="mx-auto max-w-[700px] text-gray-500">
									Create, share, and collaborate on developer blogs with ease. Harness the full
									potential of Markdown and JSX in your articles.
								</p>
							</div>
							<LinkButton to="/signup">Get Started</LinkButton>
						</div>
					</div>
				</section>
				<section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100">
					<div className="cont px-4 md:px-6">
						<h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">
							Key Features
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
							<Card>
								<div>
									<FileText className="h-8 w-8 mb-2 text-primary" />
									<h4 className="font-bold">MDX Support</h4>
								</div>
								<div>
									Write your blog posts in MDX, combining the simplicity of Markdown with the
									power of JSX.
								</div>
							</Card>
							<Card>
								<div>
									<Code className="h-8 w-8 mb-2 text-primary" />
									<h4 className="font-bold">Syntax Highlighting</h4>
								</div>
								<div>
									Beautiful code blocks with syntax highlighting for over 100 programming
									languages.
								</div>
							</Card>
							<Card>
								<div>
									<Share2 className="h-8 w-8 mb-2 text-primary" />
									<h4 className="font-bold">Easy Sharing</h4>
								</div>
								<div>
									Share your articles effortlessly with built-in social media integration and
									SEO optimization.
								</div>
							</Card>
							<Card>
								<div>
									<GitBranch className="h-8 w-8 mb-2 text-primary" />
									<h4 className="font-bold">Version Control</h4>
								</div>
								<div>
									Keep track of your article revisions with integrated Git-like version control.
								</div>
							</Card>
						</div>
					</div>
				</section>
			</main>

			<footer className="py-6 w-full shrink-0 px-4 md:px-6 border-t">
				<p className="text-sm text-gray-500 dark:text-gray-400">
					© 2024 MDXBloggers by{' '}
					<a className="underline" href="https://lukasalvarez.com">
						Lukas Alvarez
					</a>
					. All rights reserved.
				</p>
			</footer>
		</div>
	);
}
