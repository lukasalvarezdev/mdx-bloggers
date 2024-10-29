import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { protectRoute } from '~/utils/session.server';
import { Button, Card, Input, Select } from '~/utils/ui';
import { userPrefs } from '~/utils/user-prefs.server';
import { useUser } from './app';
import { githubApi } from '~/utils/github.api';

export async function loader({ request }: LoaderFunctionArgs) {
	const accessToken = await protectRoute(request);
	const response = await githubApi.getRepos(accessToken);

	if (!response.success) {
		throw new Error('Failed to fetch repositories');
	}

	return { repos: response.data };
}

export async function action({ request }: ActionFunctionArgs) {
	const accessToken = await protectRoute(request);

	const user = await githubApi.getUser({ accessToken });

	const cookieHeader = request.headers.get('Cookie');
	const cookie = (await userPrefs.parse(cookieHeader)) || {};
	const formData = new URLSearchParams(await request.text());
	const repo = formData.get('repo');
	const dir = formData.get('dir');

	if (!repo || !dir) {
		return json({ error: 'All fields are required' }, 400);
	}

	cookie.repo = repo;
	cookie.dir = dir;

	console.log(repo, dir);

	const response = await githubApi.getPosts({
		accessToken: accessToken,
		owner: user?.username as string,
		repo,
		dir,
	});

	if (!response.success) {
		if (response.error.includes('404')) {
			return json({ error: 'Directory not found' }, 404);
		}

		return json({ error: 'Failed to fetch posts' }, 500);
	}

	return redirect('/app/posts', {
		headers: {
			'Set-Cookie': await userPrefs.serialize(cookie),
		},
	});
}

export default function Component() {
	const { name } = useUser();
	const { repos } = useLoaderData<typeof loader>();
	const actionData = useActionData<typeof action>();
	const error = actionData?.error;

	return (
		<div className="h-screen w-full flex justify-center py-20">
			<Card className="mx-auto max-w-sm max-h-max w-full">
				<h4>Welcome, {name}</h4>
				<p className="text-sm text-gray-600 mb-4">
					Pick a repository and a directory where your content is stored. We&apos;ll
					automatically fetch your posts from there.
				</p>

				<Form method="POST" className="flex flex-col gap-4">
					<Select
						name="repo"
						label="Select a repository"
						options={[
							{ value: '', label: 'Pick a repository' },
							...repos.map(repo => ({ value: repo.name, label: repo.name })),
						]}
					/>

					<Input type="text" name="dir" label="Path to content directory" />

					{error ? <p className="text-red-500 text-sm">{error}</p> : null}

					<Button>Submit</Button>
				</Form>
			</Card>
		</div>
	);
}
