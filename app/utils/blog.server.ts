import { bundleMDX } from 'mdx-bundler';
import { formatDate } from './misc';
import { rehypePrettyCode } from 'rehype-pretty-code';

export async function getPostBySlug(fileContent: string) {
	const { code, frontmatter } = await bundleMDX({
		source: fileContent,
		mdxOptions(options) {
			options.remarkPlugins = [...(options.remarkPlugins ?? [])];
			options.rehypePlugins = [
				...(options.rehypePlugins ?? []),
				[rehypePrettyCode, { theme: { dark: 'github-dark-dimmed', light: 'github-light' } }],
			];

			return options;
		},
	});

	return { code, metadata: getFrontMatter(frontmatter) };
}
export type PostType = Awaited<ReturnType<typeof getPostBySlug>>;

export type FrontmatterType = {
	title: string;
	date: string;
	description: string;
	bannerCredit: string;
	bannerUrl: string;
	rawDate: string;
	meta: { keywords: string[] };
};

export function getFrontMatter(frontmatter: Record<string, unknown>): FrontmatterType {
	const matter = frontmatter as FrontmatterType;
	return { ...matter, date: formatDate(matter.date), rawDate: matter.date };
}
