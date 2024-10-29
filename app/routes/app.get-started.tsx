import { ActionFunctionArgs, redirect } from '@remix-run/node';
import { Form } from '@remix-run/react';
import { protectRoute } from '~/utils/session.server';
import { Button, Card, Input, Select } from '~/utils/ui';
import { userPrefs } from '~/utils/user-prefs.server';
import { useUser } from './app';

export async function action({ request }: ActionFunctionArgs) {
	await protectRoute(request);

	const cookieHeader = request.headers.get('Cookie');
	const cookie = (await userPrefs.parse(cookieHeader)) || {};
	const formData = new URLSearchParams(await request.text());
	const repo = formData.get('repo');
	const dir = formData.get('dir');
	cookie.repo = repo;
	cookie.dir = dir;

	return redirect('/app/posts', {
		headers: {
			'Set-Cookie': await userPrefs.serialize(cookie),
		},
	});
}

export default function Component() {
	const { name } = useUser();

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
						options={[{ value: 'lukasalvarez.com', label: 'lukasalvarez.com' }]}
					/>

					<Input type="text" name="dir" label="Path to content directory" />

					<Button>Submit</Button>
				</Form>
			</Card>
		</div>
	);
}
