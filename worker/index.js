// Cloudflare Worker — Fire Safety Client Review API
// Connects to D1 database for storing annotations

export default {
    async fetch(request, env) {
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };

        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        const url = new URL(request.url);
        const path = url.pathname;

        try {
            // GET /api/annotations — List all annotations
            if (path === '/api/annotations' && request.method === 'GET') {
                const { results } = await env.DB.prepare(
                    'SELECT * FROM annotations ORDER BY created_at DESC'
                ).all();
                return Response.json(results, { headers: corsHeaders });
            }

            // GET /api/annotations/:id — Get single annotation
            if (path.startsWith('/api/annotations/') && request.method === 'GET') {
                const id = path.split('/').pop();
                const { results } = await env.DB.prepare(
                    'SELECT * FROM annotations WHERE id = ?'
                ).bind(id).all();
                if (results.length === 0) {
                    return Response.json({ error: 'Not found' }, { status: 404, headers: corsHeaders });
                }
                return Response.json(results[0], { headers: corsHeaders });
            }

            // POST /api/annotations — Create annotation(s)
            if (path === '/api/annotations' && request.method === 'POST') {
                const body = await request.json();
                const items = Array.isArray(body) ? body : [body];
                
                const stmt = env.DB.prepare(
                    `INSERT INTO annotations (id, x, y, sentiment, comment, page_url, page_title, screenshot_url, created_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
                );
                
                const batch = items.map(a => 
                    stmt.bind(
                        a.id || crypto.randomUUID(),
                        a.x, a.y, a.sentiment,
                        a.comment || '',
                        a.page_url || '',
                        a.page_title || '',
                        a.screenshot_url || '',
                        a.created_at || new Date().toISOString()
                    )
                );
                
                await env.DB.batch(batch);
                return Response.json({ ok: true, count: items.length }, { headers: corsHeaders });
            }

            // PUT /api/annotations/:id — Update annotation
            if (path.startsWith('/api/annotations/') && request.method === 'PUT') {
                const id = path.split('/').pop();
                const body = await request.json();
                
                await env.DB.prepare(
                    `UPDATE annotations SET sentiment = ?, comment = ?, updated_at = datetime('now') WHERE id = ?`
                ).bind(body.sentiment, body.comment || '', id).run();
                
                return Response.json({ ok: true }, { headers: corsHeaders });
            }

            // DELETE /api/annotations/:id — Delete annotation
            if (path.startsWith('/api/annotations/') && request.method === 'DELETE') {
                const id = path.split('/').pop();
                await env.DB.prepare('DELETE FROM annotations WHERE id = ?').bind(id).run();
                return Response.json({ ok: true }, { headers: corsHeaders });
            }

            // DELETE /api/annotations — Clear all annotations
            if (path === '/api/annotations' && request.method === 'DELETE') {
                await env.DB.prepare('DELETE FROM annotations').run();
                return Response.json({ ok: true }, { headers: corsHeaders });
            }

            // GET /api/stats — Get annotation statistics
            if (path === '/api/stats' && request.method === 'GET') {
                const { results } = await env.DB.prepare(
                    `SELECT sentiment, COUNT(*) as count FROM annotations GROUP BY sentiment`
                ).all();
                
                const stats = { like: 0, dislike: 0, neutral: 0, total: 0 };
                results.forEach(r => {
                    stats[r.sentiment] = r.count;
                    stats.total += r.count;
                });
                
                return Response.json(stats, { headers: corsHeaders });
            }

            // Serve the frontend for root path
            if (path === '/' || path === '') {
                return env.ASSETS.fetch(request);
            }

            return Response.json({ error: 'Not found' }, { status: 404, headers: corsHeaders });
            
        } catch (err) {
            return Response.json({ error: err.message }, { status: 500, headers: corsHeaders });
        }
    }
};
