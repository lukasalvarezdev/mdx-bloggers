import { ActionFunctionArgs, redirect } from '@remix-run/node';
import { Form } from '@remix-run/react';
import { Button, Card } from '~/utils/ui';
import { userPrefs } from '~/utils/user-prefs.server';

export async function action({ request }: ActionFunctionArgs) {
	const cookieHeader = request.headers.get('Cookie');
	const cookie = (await userPrefs.parse(cookieHeader)) || {};
	const formData = new URLSearchParams(await request.text());
	const repo = formData.get('repo');
	const dir = formData.get('dir');
	cookie.repo = repo;
	cookie.dir = dir;

	return redirect('/posts', {
		headers: {
			'Set-Cookie': await userPrefs.serialize(cookie),
		},
	});
}

export default function Component() {
	return (
		<div className="h-screen w-full flex justify-center py-20">
			<Card className="mx-auto max-w-sm max-h-max">
				<h3>Welcome, Lukas Alvarez</h3>

				<Form method="POST">
					<div>
						<label htmlFor="s" className="block">
							select a repository
						</label>
						<select name="repo" id="">
							<option value="lukasalvarez.com">repo 1</option>
						</select>
					</div>

					<div>
						<label htmlFor="s" className="block">
							select a directory
						</label>
						<input type="text" name="dir" id="" />
					</div>

					<Button>Submit</Button>
				</Form>
			</Card>
		</div>
	);
}
