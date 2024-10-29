import { redirect } from '@remix-run/node';
import { Form } from '@remix-run/react';
import { Github } from 'lucide-react';
import { Button, Card } from '~/utils/ui';

export async function action() {
	const clientId = process.env.GITHUB_CLIENT_ID;
	const state = Math.random().toString(36).substring(7);
	const params = new URLSearchParams({
		redirect_uri: process.env.GITHUB_CALLBACK_URL!,
		client_id: clientId!,
		scope: 'public_repo',
		state,
	});

	return redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
}

export default function Component() {
	return (
		<div className="h-screen w-full flex justify-center py-20">
			<Card className="mx-auto max-w-sm max-h-max w-full">
				<h4>Welcome to MDX Bloggers!</h4>
				<p className="text-sm text-gray-600 mb-4">
					Login with github to get started. We&apos;ll use your github account to create a new
					repository and push your posts to it.
				</p>

				<Form method="POST" className="flex flex-col gap-4">
					<Button className="gap-4 text-sm">
						<Github />
						Login with github
					</Button>
				</Form>
			</Card>
		</div>
	);
}
