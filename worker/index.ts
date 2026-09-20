export interface Env {
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Stateless Edge API handlers (/api/*)
    if (url.pathname.startsWith('/api/')) {
      if (url.pathname === '/api/health') {
        return new Response(
          JSON.stringify({
            status: 'operational',
            system: 'SHADOW CLUB Core',
            runtime: 'Cloudflare Workers',
            timestamp: new Date().toISOString(),
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'Cache-Control': 'no-store',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }

      if (url.pathname === '/api/ping') {
        return new Response(
          JSON.stringify({
            pong: true,
            clearance: 'OPERATIVE_LEVEL_1',
            protocol: 'SHADOW_EDGE_V2',
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }

      return new Response(
        JSON.stringify({
          error: 'Not Found',
          message: 'Secure sector endpoint unrecognized.',
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
        }
      );
    }

    // Pass through to Cloudflare Workers Static Assets binding (SPA routing)
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Asset binding not configured.', { status: 500 });
  },
};
