import * as React from 'react';
import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from '@remix-run/node';
import {
	Form,
	isRouteErrorResponse,
	Link,
	useLoaderData,
	useRouteError,
} from '@remix-run/react';
import { getMDXComponent } from 'mdx-bundler/client';
import { blogPageMeta } from '~/utils/blog.meta';
import { protectRoute } from '~/utils/session.server';
import { getUserPrefs } from '~/utils/user-prefs.server';
import { githubApi } from '~/utils/github.api';
import { getPostBySlug } from '~/utils/blog.server';
import { ArrowBack, Button, Input, LinkButton } from '~/utils/ui';
import {
	diffSourcePlugin,
	headingsPlugin,
	MDXEditor,
	listsPlugin,
	linkPlugin,
	codeBlockPlugin,
	codeMirrorPlugin,
} from '@mdxeditor/editor';
import { cn } from '~/utils/misc';
import { z } from 'zod';

const plugins = [
	diffSourcePlugin({ viewMode: 'source' }),
	headingsPlugin(),
	listsPlugin(),
	linkPlugin(),
	codeBlockPlugin(),
	codeMirrorPlugin(),
];

export const meta = blogPageMeta;

export async function loader({ params, request }: LoaderFunctionArgs) {
	const { slug } = params;
	if (!slug) throw new Error('No slug provided');

	const accessToken = await protectRoute(request);
	const user = await githubApi.getUser({ accessToken });

	if (!user) throw new Error('Failed to fetch user');

	const { repo, dir } = await getUserPrefs(request);

	const response = await githubApi.getPostBySlug({
		owner: user.username,
		accessToken,
		slug,
		repo,
		dir,
	});

	if (!response.success) {
		if (response.error.includes('Not Found') && response.error.includes('404')) {
			throw new Response('Post not found', { status: 404 });
		}

		throw new Error(response.error);
	}

	const fileResponse = await fetch(response.data.download_url);

	const text = await fileResponse.text();
	const post = await getPostBySlug(text);

	return { ...post, slug, text, sha: response.data.sha };
}

export async function action({ request, params }: ActionFunctionArgs) {
	const accessToken = await protectRoute(request);

	const user = await githubApi.getUser({ accessToken });

	const { dir, repo } = await getUserPrefs(request);
	const formData = new URLSearchParams(await request.text());
	const { content, sha, ...frontMatter } = schema.parse(Object.fromEntries(formData.entries()));
	const newContent = updateFrontMatter(content, frontMatter);

	if (!content || !sha) {
		return json({ error: 'All fields are required' }, 400);
	}

	const response = await githubApi.updateFile({
		accessToken: accessToken,
		owner: user?.username as string,
		repo,
		dir,
		content: newContent,
		slug: params.slug as string,
		sha,
	});

	if (!response.success) {
		return json({ error: 'Failed to fetch posts' }, 500);
	}

	return redirect('/app/posts');
}

export default function BlogPost() {
	const { code, slug, metadata, text, sha } = useLoaderData<typeof loader>();
	const [mode, setMode] = React.useState<'source' | 'preview'>('preview');
	const [content, setContent] = React.useState<string>(processFrontMatter(text));

	const Component = React.useMemo(() => getMDXComponent(code), [code]);

	return (
		<div key={slug} className="py-12">
			<div className="max-w-2xl mx-auto">
				<Link
					to="/app/posts"
					className="flex gap-2 mb-8 text-base text-black items-center group max-w-max"
				>
					<ArrowBack className="group-hover:-translate-x-1 transition-all" />
					Back to posts
				</Link>
				<h1 className="mb-2 text-black">{metadata.title}</h1>
				<p className="text-sm mb-8">{metadata.date}</p>
			</div>

			<div className="sticky z-10 top-0 mb-4 bg-white py-4">
				<div className="max-w-2xl mx-auto flex justify-between items-center">
					<div
						className={cn(
							'bg-gray-100 rounded-md max-w-max h-9 border border-gray-200 flex items-center text-sm',
							'overflow-hidden',
						)}
					>
						<button
							className={cn('font-medium px-2 h-9', {
								'bg-gray-700 text-white': mode === 'source',
							})}
							onClick={() => setMode('source')}
						>
							View Source
						</button>
						<button
							className={cn('font-medium px-2 h-9', {
								'bg-gray-700 text-white': mode === 'preview',
							})}
							onClick={() => setMode('preview')}
						>
							View Preview
						</button>
					</div>

					<div>
						<Form method="POST" id="mdx-form">
							<input type="hidden" name="content" value={content} />
							<input type="hidden" name="sha" value={sha} />
							<Button className="text-sm">Save Changes</Button>
						</Form>
					</div>
				</div>
			</div>

			{mode === 'source' ? (
				<div className="max-w-2xl mx-auto relative">
					<div className="mb-4 flex flex-col gap-4">
						<Input name="title" label="Title" defaultValue={metadata.title} form="mdx-form" />
						<Input
							name="description"
							label="Description"
							defaultValue={metadata.description}
							form="mdx-form"
						/>
						<Input name="date" label="Date" defaultValue={metadata.date} form="mdx-form" />
						<Input
							name="bannerUrl"
							label="Banner URL"
							defaultValue={metadata.bannerUrl}
							form="mdx-form"
						/>
						<Input
							name="bannerCredit"
							label="Banner Credit"
							defaultValue={metadata.bannerCredit}
							form="mdx-form"
						/>
					</div>

					<MDXEditor
						className="border border-gray-200 rounded-lg overflow-hidden"
						plugins={plugins}
						markdown={content}
						onChange={setContent}
					/>
				</div>
			) : (
				<>
					<div className="max-w-4xl mx-auto">
						<img
							src={metadata.bannerUrl}
							alt={metadata.bannerCredit}
							className="w-full object-cover rounded-lg mb-8"
							loading="lazy"
						/>
					</div>

					<div className="mdx max-w-2xl mx-auto">
						<Component />
					</div>
				</>
			)}
		</div>
	);
}

export function ErrorBoundary() {
	const error = useRouteError();

	if (isRouteErrorResponse(error)) {
		return (
			<div className="flex pt-20 justify-center w-full">
				<div className="text-center">
					<h1>
						{error.status} {error.statusText}
					</h1>
					<p>{error.data}</p>

					<LinkButton to="/app/posts" className="block mt-8">
						Go back
					</LinkButton>
				</div>
			</div>
		);
	} else if (error instanceof Error) {
		return (
			<div className="flex pt-20 justify-center w-full">
				<div className="text-center">
					<h1>Unknown Error</h1>
					<p>{error.message}</p>

					<LinkButton to="/app/posts" className="block mt-8">
						Go back
					</LinkButton>
				</div>
			</div>
		);
	} else {
		return <h1>Unknown Error</h1>;
	}
}

function updateFrontMatter(
	content: string,
	newFrontMatter: z.infer<typeof frontMatterSchema>,
): string {
	// Convert new front matter object to string format
	const frontMatterString = `---\ntitle: ${newFrontMatter.title}\ndate: ${newFrontMatter.date}\ndescription: ${newFrontMatter.description}\nbannerUrl: ${newFrontMatter.bannerUrl}\nbannerCredit: ${newFrontMatter.bannerCredit}\n---`;

	// Remove the existing front matter block
	const remainingContent = content.replace(/^---\n[\s\S]*?\n---\n?/, '');

	// Return new front matter appended to the content
	return `${frontMatterString}\n${remainingContent}`;
}

function processFrontMatter(content: string): string {
	// Match the front matter block
	const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
	if (!frontMatterMatch) return content;

	// Remove the front matter from the original content
	return content.replace(/^---\n[\s\S]*?\n---\n?/, '');
}

const schema = z.object({
	title: z.string(),
	date: z.string(),
	bannerUrl: z.string(),
	bannerCredit: z.string(),
	content: z.string(),
	sha: z.string(),
	description: z.string(),
});
const frontMatterSchema = schema.pick({
	title: true,
	date: true,
	bannerUrl: true,
	bannerCredit: true,
	description: true,
});
