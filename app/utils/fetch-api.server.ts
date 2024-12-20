import { type z } from 'zod';

type SchemaType = z.ZodSchema | undefined;

type Options<S extends SchemaType> = {
	method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
	schema?: S;
	body?: unknown;
	token?: string;
};

export type ApiResponse<S extends SchemaType> =
	| {
			success: true;
			data: S extends z.ZodSchema ? z.infer<S> : unknown;
			// eslint-disable-next-line no-mixed-spaces-and-tabs
	  }
	| { success: false; error: string };

export async function fetchApi<S extends SchemaType = undefined>(
	path: string,
	options: Options<S>,
): Promise<ApiResponse<S>> {
	const { schema } = options;
	const init = await getFetchInit();

	try {
		const url = path.startsWith('http') ? path : apiUrl + path;

		const response = await fetch(url, init);

		if (!response.ok) {
			const error = await response.text();
			console.error({ error, url, init });
			return { success: false, error };
		}

		let data = await response.json();

		if (schema) {
			const result = schema.safeParse(data);

			if (!result.success) {
				console.error(JSON.stringify(result.error, null, 2));
				return { success: false, error: 'Failed to parse response' };
			}

			data = result.data;
		}

		return { success: true, data };
	} catch (error) {
		return { success: false, error: 'Unkwnon error' };
	}

	async function getFetchInit(): Promise<RequestInit> {
		const headers = new Headers({
			'Content-Type': 'application/json',
			Accept: 'application/json',
		});

		if (options.token) {
			headers.set('Authorization', `Bearer ${options.token}`);
		}

		return { headers, method: options.method, body: getBody() };
	}

	function getBody() {
		return options.method === 'GET' ? undefined : JSON.stringify(options.body);
	}
}

export const apiUrl = 'https://api.github.com';
