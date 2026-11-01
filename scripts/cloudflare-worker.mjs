import initialDb from './cloudflare-db.json';

let state = JSON.parse(JSON.stringify(initialDb));

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
    },
  });
}

function getPublished(entity) {
  const rows = [...(state[entity] || [])];
  if (entity === 'courses') {
    return rows
      .filter((r) => r.status === 'ACTIVE')
      .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || String(a.name || '').localeCompare(String(b.name || '')));
  }
  if (entity === 'events') {
    return rows
      .filter((r) => r.publication === 'PUBLISHED' || r.publication === 'SCHEDULED')
      .sort((a, b) => String(a.startsAt || '').localeCompare(String(b.startsAt || '')));
  }
  if (entity === 'news') {
    return rows
      .filter((r) => r.status === 'PUBLISHED' || r.status === 'SCHEDULED')
      .sort((a, b) => String(b.publishAt || '').localeCompare(String(a.publishAt || '')));
  }
  if (entity === 'campaigns') {
    return rows
      .filter((r) => r.status === 'PUBLISHED' || r.status === 'SCHEDULED')
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
  }
  if (entity === 'media') {
    return rows
      .filter((r) => String(r.mimeType || '').startsWith('image/'))
      .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  }
  return rows;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
      return json({ ok: true });
    }

    if (path.startsWith('/api/')) {
      if (path === '/api/health') {
        return json({ status: 'ok' });
      }

      if (path === '/api/public/home' && request.method === 'GET') {
        const events = getPublished('events');
        return json({
          courses: getPublished('courses'),
          events: events.slice(0, 4),
          news: getPublished('news').slice(0, 3),
          campaigns: getPublished('campaigns'),
          sections: [...(state.sections || [])].sort((a, b) => Number(a.order || 0) - Number(b.order || 0)),
          settings: state.settings || {},
        });
      }

      if (path === '/api/public/leads' && request.method === 'POST') {
        const body = await request.json().catch(() => ({}));
        if (!body.name || !body.phone) {
          return json({ message: 'Nome e telefone são obrigatórios.' }, 422);
        }
        const lead = {
          id: crypto.randomUUID(),
          name: String(body.name),
          phone: String(body.phone),
          whatsapp: body.whatsapp || body.phone,
          email: body.email || '',
          course: body.course || '',
          municipality: body.municipality || '',
          notes: body.notes || '',
          status: 'NEW',
          createdAt: new Date().toISOString(),
        };
        state.leads = [lead, ...(state.leads || [])];
        return json(lead, 201);
      }

      const publicMatch = path.match(/^\/api\/public\/(courses|events|news|media)(?:\/([^/]+))?$/);
      if (publicMatch && request.method === 'GET') {
        const [, entity, rawSlug] = publicMatch;
        let items = getPublished(entity);
        if (rawSlug) {
          const slug = decodeURIComponent(rawSlug);
          const found = items.find((item) => item.slug === slug);
          return found ? json(found) : json({ message: 'Registo não encontrado.' }, 404);
        }
        const q = (url.searchParams.get('q') || '').toLowerCase();
        if (entity === 'courses' && q) {
          items = items.filter(
            (r) => String(r.name || '').toLowerCase().includes(q) || String(r.area || '').toLowerCase().includes(q)
          );
        }
        return json(items);
      }

      if (path === '/api/auth/login' && request.method === 'POST') {
        const body = await request.json().catch(() => ({}));
        const rawId = String(body.identifier || body.email || '').trim().toLowerCase();
        const password = String(body.password || '').trim();
        const users = state.users || [];
        const user =
          users.find((u) => String(u.email || '').toLowerCase() === rawId || String(u.email || '').toLowerCase() === `${rawId}@paraisodosaber.ao`) ||
          users[0] || {
            id: 'admin-1',
            name: 'Administrador Principal',
            email: 'admin@paraisodosaber.ao',
            role: 'ADMIN',
            active: true,
          };
        if ((rawId === 'admin' || rawId === 'admin@paraisodosaber.ao' || user) && (password === 'admin123456' || password === 'Paraiso2026!')) {
          return json({ token: 'cf-admin-session-token', user });
        }
        return json({ message: 'E-mail ou palavra-passe inválidos.' }, 422);
      }

      if (path === '/api/auth/me' && request.method === 'GET') {
        const auth = request.headers.get('Authorization') || '';
        if (!auth.startsWith('Bearer ')) {
          return json({ message: 'Não autenticado.' }, 401);
        }
        const user = (state.users && state.users[0]) || {
          id: 'admin-1',
          name: 'Administrador Principal',
          email: 'admin@paraisodosaber.ao',
          role: 'ADMIN',
          active: true,
        };
        return json(user);
      }

      if (path === '/api/auth/logout' && request.method === 'POST') {
        return json({ success: true });
      }

      if (path === '/api/auth/password/forgot' && request.method === 'POST') {
        return json({
          message: 'Se a conta estiver ativa, enviaremos uma ligação de recuperação para o endereço de e-mail indicado.',
        });
      }

      if (path === '/api/admin/dashboard' && request.method === 'GET') {
        return json({
          courses: getPublished('courses').length,
          events: getPublished('events').length,
          campaigns: getPublished('campaigns').length,
          news: getPublished('news').length,
          leads: (state.leads || []).length,
          media: (state.media || []).length,
        });
      }

      if (path === '/api/admin/settings' && request.method === 'GET') {
        return json({
          settings: state.settings || {},
          sections: [...(state.sections || [])].sort((a, b) => Number(a.order || 0) - Number(b.order || 0)),
        });
      }

      if (path === '/api/admin/settings' && request.method === 'PUT') {
        const body = await request.json().catch(() => ({}));
        state.settings = { ...(state.settings || {}), ...body };
        return json(state.settings);
      }

      const sectionMatch = path.match(/^\/api\/admin\/home-sections\/([^/]+)$/);
      if (sectionMatch && request.method === 'PUT') {
        const id = sectionMatch[1];
        const body = await request.json().catch(() => ({}));
        state.sections = (state.sections || []).map((s) => (s.id === id ? { ...s, ...body } : s));
        return json(state.sections.find((s) => s.id === id) || body);
      }

      const adminEntityMatch = path.match(/^\/api\/admin\/(courses|events|campaigns|news|leads|users|media|audit)(?:\/([^/]+))?$/);
      if (adminEntityMatch) {
        const [, entity, id] = adminEntityMatch;
        if (request.method === 'GET') {
          return json(state[entity] || []);
        }
        if (request.method === 'POST') {
          const body = await request.json().catch(() => ({}));
          const created = {
            id: crypto.randomUUID(),
            ...body,
            createdAt: new Date().toISOString(),
          };
          state[entity] = [created, ...(state[entity] || [])];
          return json(created, 201);
        }
        if (request.method === 'PUT' && id) {
          const body = await request.json().catch(() => ({}));
          state[entity] = (state[entity] || []).map((item) => (item.id === id ? { ...item, ...body } : item));
          return json((state[entity] || []).find((item) => item.id === id) || body);
        }
        if (request.method === 'DELETE' && id) {
          state[entity] = (state[entity] || []).filter((item) => item.id !== id);
          return json({ deleted: true });
        }
      }

      return json({ message: 'Endpoint não encontrado.' }, 404);
    }

    return env.ASSETS.fetch(request);
  },
};

