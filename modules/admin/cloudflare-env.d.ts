interface CloudflareEnv {
	IMAGES: ImagesBinding;
	ASSETS: Fetcher;
	WORKER_SELF_REFERENCE: Fetcher;
	BACKEND_URL: string;
}

declare namespace Cloudflare {
	interface Env extends CloudflareEnv {}
}
