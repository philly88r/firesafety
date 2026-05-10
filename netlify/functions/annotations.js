const { getStore } = require('@netlify/blob');

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

exports.handler = async (event) => {
    // CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    const store = getStore({ name: 'flame-annotations' });
    const path = event.path.replace('/api/annotations', '');

    try {
        // GET /api/annotations — List all
        if (event.httpMethod === 'GET' && !path) {
            const data = await store.get('annotations', { type: 'json' });
            return { statusCode: 200, headers, body: JSON.stringify(data || []) };
        }

        // POST /api/annotations — Create
        if (event.httpMethod === 'POST' && !path) {
            const body = JSON.parse(event.body);
            const items = Array.isArray(body) ? body : [body];
            const existing = (await store.get('annotations', { type: 'json' })) || [];
            const all = [...existing, ...items];
            await store.set('annotations', JSON.stringify(all), { contentType: 'application/json' });
            return { statusCode: 200, headers, body: JSON.stringify({ ok: true, count: items.length }) };
        }

        // DELETE /api/annotations/:id — Delete one
        if (event.httpMethod === 'DELETE' && path) {
            const id = path.replace('/', '');
            const existing = (await store.get('annotations', { type: 'json' })) || [];
            const filtered = existing.filter(a => a.id !== id);
            await store.set('annotations', JSON.stringify(filtered), { contentType: 'application/json' });
            return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
        }

        // DELETE /api/annotations — Clear all
        if (event.httpMethod === 'DELETE' && !path) {
            await store.set('annotations', JSON.stringify([]), { contentType: 'application/json' });
            return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
        }

        // GET /api/stats
        if (event.httpMethod === 'GET' && path === '/stats') {
            const data = (await store.get('annotations', { type: 'json' })) || [];
            const stats = { like: 0, dislike: 0, neutral: 0, total: data.length };
            data.forEach(a => { if (stats[a.sentiment] !== undefined) stats[a.sentiment]++; });
            return { statusCode: 200, headers, body: JSON.stringify(stats) };
        }

        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Not found' }) };
    } catch (err) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
    }
};
