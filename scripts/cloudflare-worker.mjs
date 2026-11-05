import initialDb from './cloudflare-db.json';

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

function parseSettings(rows) {
  const settings = {};
  for (const r of rows) {
    settings[r.key] = r.value;
  }
  return settings;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const db = env.DB;

    if (request.method === 'OPTIONS') {
      return json({ ok: true });
    }

    // Servir ficheiros carregados no R2
    if (path.startsWith('/uploads/') && request.method === 'GET') {
      if (env.ASSETS_R2) {
        const key = decodeURIComponent(path.slice('/uploads/'.length));
        const object = await env.ASSETS_R2.get(key);
        if (!object) {
          return new Response('Ficheiro não encontrado.', { status: 404 });
        }
        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');
        headers.set('Access-Control-Allow-Origin', '*');
        return new Response(object.body, { headers });
      }
      return new Response('Armazenamento R2 ainda não vinculado.', { status: 404 });
    }

    if (path.startsWith('/api/')) {
      if (path === '/api/health') {
        return json({ status: 'ok', d1: Boolean(db), r2: Boolean(env.ASSETS_R2) });
      }

      // Public Home Data
      if (path === '/api/public/home' && request.method === 'GET') {
        if (db) {
          try {
            const [coursesRes, eventsRes, newsRes, campaignsRes, sectionsRes, settingsRes] = await Promise.all([
              db.prepare("SELECT * FROM courses WHERE status = 'ACTIVE' ORDER BY featured DESC, name ASC").all(),
              db.prepare("SELECT * FROM events WHERE publication IN ('PUBLISHED', 'SCHEDULED') ORDER BY startsAt ASC LIMIT 4").all(),
              db.prepare("SELECT * FROM news WHERE status IN ('PUBLISHED', 'SCHEDULED') ORDER BY publishAt DESC LIMIT 3").all(),
              db.prepare("SELECT * FROM campaigns WHERE status IN ('PUBLISHED', 'SCHEDULED') ORDER BY \"order\" ASC").all(),
              db.prepare('SELECT * FROM sections ORDER BY "order" ASC').all(),
              db.prepare('SELECT key, value FROM settings').all(),
            ]);

            return json({
              courses: (coursesRes.results || []).map((r) => ({ ...r, featured: Boolean(r.featured) })),
              events: eventsRes.results || [],
              news: newsRes.results || [],
              campaigns: campaignsRes.results || [],
              sections: (sectionsRes.results || []).map((r) => ({ ...r, enabled: Boolean(r.enabled) })),
              settings: parseSettings(settingsRes.results || []),
            });
          } catch (e) {
            console.error('D1 home error, falling back:', e);
          }
        }

        // Fallback if D1 not ready
        return json({
          courses: (initialDb.courses || []).filter((r) => r.status === 'ACTIVE'),
          events: (initialDb.events || []).slice(0, 4),
          news: (initialDb.news || []).slice(0, 3),
          campaigns: initialDb.campaigns || [],
          sections: initialDb.sections || [],
          settings: initialDb.settings || {},
        });
      }

      // Public Leads Submission
      if (path === '/api/public/leads' && request.method === 'POST') {
        const body = await request.json().catch(() => ({}));
        if (!body.name || !body.phone) {
          return json({ message: 'Nome e telefone são obrigatórios.' }, 422);
        }
        const lead = {
          id: crypto.randomUUID(),
          name: String(body.name).trim(),
          phone: String(body.phone).trim(),
          whatsapp: String(body.whatsapp || body.phone).trim(),
          email: String(body.email || '').trim(),
          course: String(body.course || '').trim(),
          municipality: String(body.municipality || '').trim(),
          notes: String(body.notes || '').trim(),
          status: 'NEW',
          createdAt: new Date().toISOString(),
        };

        if (db) {
          try {
            await db
              .prepare(
                'INSERT INTO leads (id, name, phone, whatsapp, email, course, municipality, notes, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
              )
              .bind(
                lead.id,
                lead.name,
                lead.phone,
                lead.whatsapp,
                lead.email,
                lead.course,
                lead.municipality,
                lead.notes,
                lead.status,
                lead.createdAt
              )
              .run();
          } catch (e) {
            console.error('D1 insert lead error:', e);
          }
        }

        return json(lead, 201);
      }

      // Public Entity List & Detail
      const publicMatch = path.match(/^\/api\/public\/(courses|events|news|media)(?:\/([^/]+))?$/);
      if (publicMatch && request.method === 'GET') {
        const [, entity, rawSlug] = publicMatch;
        const q = (url.searchParams.get('q') || '').toLowerCase().trim();

        if (db) {
          try {
            if (rawSlug) {
              const slug = decodeURIComponent(rawSlug);
              const row = await db.prepare(`SELECT * FROM ${entity} WHERE slug = ?`).bind(slug).first();
              return row ? json(row) : json({ message: 'Registo não encontrado.' }, 404);
            }

            let query = `SELECT * FROM ${entity}`;
            const params = [];
            if (entity === 'courses') {
              query += " WHERE status = 'ACTIVE'";
              if (q) {
                query += ' AND (lower(name) LIKE ? OR lower(area) LIKE ?)';
                params.push(`%${q}%`, `%${q}%`);
              }
              query += ' ORDER BY featured DESC, name ASC';
            } else if (entity === 'events') {
              query += " WHERE publication IN ('PUBLISHED', 'SCHEDULED') ORDER BY startsAt ASC";
            } else if (entity === 'news') {
              query += " WHERE status IN ('PUBLISHED', 'SCHEDULED') ORDER BY publishAt DESC";
            } else if (entity === 'media') {
              query += " WHERE mimeType LIKE 'image/%' ORDER BY createdAt DESC";
            }

            const res = params.length ? await db.prepare(query).bind(...params).all() : await db.prepare(query).all();
            const results = (res.results || []).map((r) => ({
              ...r,
              featured: r.featured !== undefined ? Boolean(r.featured) : undefined,
            }));
            return json(results);
          } catch (e) {
            console.error(`D1 public ${entity} error:`, e);
          }
        }

        // Fallback
        let items = initialDb[entity] || [];
        if (rawSlug) {
          const slug = decodeURIComponent(rawSlug);
          const found = items.find((item) => item.slug === slug);
          return found ? json(found) : json({ message: 'Registo não encontrado.' }, 404);
        }
        if (entity === 'courses' && q) {
          items = items.filter(
            (r) => String(r.name || '').toLowerCase().includes(q) || String(r.area || '').toLowerCase().includes(q)
          );
        }
        return json(items);
      }

      // Authentication Helper
      const resolveAuthUser = async () => {
        const auth = request.headers.get('Authorization') || '';
        if (!auth.startsWith('Bearer ')) return null;
        const token = auth.slice(7).trim();
        const parts = token.match(/^cf-session-(ADMIN|EDITOR|ATTENDANCE)-(.+)$/);
        if (!parts) return null;
        const [, role, id] = parts;

        if (db) {
          try {
            const user = await db.prepare('SELECT id, email, name, role, active, createdAt, updatedAt FROM users WHERE id = ? AND role = ? AND active != 0').bind(id, role).first();
            if (user) return { ...user, active: Boolean(user.active) };
          } catch (e) {
            console.error('D1 resolveAuthUser error:', e);
          }
        }

        const users = initialDb.users || [];
        const matched = users.find((u) => u.id === id && u.role === role && u.active !== false);
        return matched || null;
      };

      const canAccessEntity = (role, entity, mode = 'read') => {
        if (role === 'ADMIN') return true;
        if (role === 'EDITOR') {
          const allowed = mode === 'read' ? ['events', 'campaigns', 'news', 'media', 'audit'] : ['events', 'campaigns', 'news', 'media'];
          return allowed.includes(entity);
        }
        if (role === 'ATTENDANCE') {
          const allowed = mode === 'read' ? ['courses', 'leads', 'users', 'sections', 'audit'] : ['courses', 'leads', 'sections'];
          return allowed.includes(entity);
        }
        return false;
      };

      // Login
      if (path === '/api/auth/login' && request.method === 'POST') {
        const body = await request.json().catch(() => ({}));
        const rawId = String(body.identifier || body.email || '').trim().toLowerCase();
        const password = String(body.password || '').trim();
        const validPasswords = ['admin123456', 'editor123456', 'secretaria123456', 'Paraiso2026!'];

        let user = null;
        if (db) {
          try {
            user = await db.prepare('SELECT * FROM users WHERE lower(email) = ? AND active != 0').bind(rawId).first();
            if (!user && rawId === 'atendimento') {
              user = await db.prepare('SELECT * FROM users WHERE email = ? AND active != 0').bind('secretaria@paraisodosaber.ao').first();
            }
          } catch (e) {
            console.error('D1 login user lookup error:', e);
          }
        }

        if (!user) {
          const users = initialDb.users || [];
          user = users.find((u) => String(u.email || '').toLowerCase() === rawId || (rawId === 'atendimento' && u.role === 'ATTENDANCE'));
        }

        if (user && user.active !== false && validPasswords.includes(password)) {
          const cleanUser = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            active: Boolean(user.active),
          };
          return json({ token: `cf-session-${user.role}-${user.id}`, user: cleanUser });
        }
        return json({ message: 'E-mail ou palavra-passe inválidos.' }, 422);
      }

      if (path === '/api/auth/me' && request.method === 'GET') {
        const user = await resolveAuthUser();
        if (!user) return json({ message: 'Não autenticado.' }, 401);
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

      // Admin Dashboard
      if (path === '/api/admin/dashboard' && request.method === 'GET') {
        const user = await resolveAuthUser();
        if (!user) return json({ message: 'Não autenticado.' }, 401);

        if (db) {
          try {
            const [courses, events, campaigns, news, leads, media] = await Promise.all([
              db.prepare('SELECT count(*) as total FROM courses').first(),
              db.prepare('SELECT count(*) as total FROM events').first(),
              db.prepare('SELECT count(*) as total FROM campaigns').first(),
              db.prepare('SELECT count(*) as total FROM news').first(),
              db.prepare('SELECT count(*) as total FROM leads').first(),
              db.prepare('SELECT count(*) as total FROM media').first(),
            ]);
            return json({
              courses: courses?.total || 0,
              events: events?.total || 0,
              campaigns: campaigns?.total || 0,
              news: news?.total || 0,
              leads: leads?.total || 0,
              media: media?.total || 0,
            });
          } catch (e) {
            console.error('D1 dashboard stats error:', e);
          }
        }

        return json({
          courses: (initialDb.courses || []).length,
          events: (initialDb.events || []).length,
          campaigns: (initialDb.campaigns || []).length,
          news: (initialDb.news || []).length,
          leads: (initialDb.leads || []).length,
          media: (initialDb.media || []).length,
        });
      }

      // Admin Settings
      if (path === '/api/admin/settings') {
        const user = await resolveAuthUser();
        if (!user) return json({ message: 'Não autenticado.' }, 401);
        if (request.method === 'GET') {
          if (!canAccessEntity(user.role, 'settings', 'read')) return json({ message: 'Sem permissão.' }, 403);
          if (db) {
            const rows = await db.prepare('SELECT key, value FROM settings').all();
            return json(parseSettings(rows.results || []));
          }
          return json(initialDb.settings || {});
        }
        if (request.method === 'PUT') {
          if (!canAccessEntity(user.role, 'settings', 'write')) return json({ message: 'Sem permissão.' }, 403);
          const body = await request.json().catch(() => ({}));
          if (db) {
            const batch = Object.entries(body).map(([key, val]) =>
              db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').bind(key, String(val ?? ''))
            );
            await db.batch(batch);
            const rows = await db.prepare('SELECT key, value FROM settings').all();
            return json(parseSettings(rows.results || []));
          }
          return json(body);
        }
      }

      // Admin Sections
      if (path === '/api/admin/sections' && request.method === 'GET') {
        const user = await resolveAuthUser();
        if (!user) return json({ message: 'Não autenticado.' }, 401);
        if (!canAccessEntity(user.role, 'sections', 'read')) return json({ message: 'Sem permissão.' }, 403);
        if (db) {
          const res = await db.prepare('SELECT * FROM sections ORDER BY "order" ASC').all();
          return json((res.results || []).map((r) => ({ ...r, enabled: Boolean(r.enabled) })));
        }
        return json(initialDb.sections || []);
      }

      const sectionMatch = path.match(/^\/api\/admin\/home-sections\/([^/]+)$/);
      if (sectionMatch && request.method === 'PUT') {
        const user = await resolveAuthUser();
        if (!user) return json({ message: 'Não autenticado.' }, 401);
        if (!canAccessEntity(user.role, 'sections', 'write')) return json({ message: 'Sem permissão.' }, 403);
        const id = sectionMatch[1];
        const body = await request.json().catch(() => ({}));
        if (db) {
          const fields = Object.keys(body).filter((k) => k !== 'id');
          if (fields.length) {
            const setClause = fields.map((k) => `"${k}" = ?`).join(', ');
            const values = fields.map((k) => (k === 'enabled' ? (body[k] ? 1 : 0) : body[k]));
            await db.prepare(`UPDATE sections SET ${setClause} WHERE id = ?`).bind(...values, id).run();
          }
          const row = await db.prepare('SELECT * FROM sections WHERE id = ?').bind(id).first();
          return json(row ? { ...row, enabled: Boolean(row.enabled) } : body);
        }
        return json(body);
      }

      // Admin Leads Export CSV & Excel
      if ((path === '/api/admin/leads/export.csv' || path === '/api/admin/leads/export.xlsx') && request.method === 'GET') {
        const user = await resolveAuthUser();
        if (!user) return json({ message: 'Não autenticado.' }, 401);
        if (!canAccessEntity(user.role, 'leads', 'read')) return json({ message: 'Sem permissão.' }, 403);

        let leads = [];
        if (db) {
          const res = await db.prepare('SELECT * FROM leads ORDER BY createdAt DESC').all();
          leads = res.results || [];
        } else {
          leads = initialDb.leads || [];
        }

        const headers = ['ID', 'Nome', 'Telefone', 'WhatsApp', 'E-mail', 'Curso', 'Município', 'Notas', 'Estado', 'Data de Registo'];
        const escapeCsv = (val) => '"' + String(val ?? '').replace(/"/g, '""') + '"';
        const rows = [
          headers.map(escapeCsv).join(';'),
          ...leads.map((l) => [
            l.id,
            l.name,
            l.phone,
            l.whatsapp,
            l.email,
            l.course,
            l.municipality,
            l.notes,
            l.status,
            l.createdAt,
          ].map(escapeCsv).join(';')),
        ];

        return new Response('\uFEFF' + rows.join('\r\n'), {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': 'attachment; filename="pedidos-informacao.csv"',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // Admin File Uploads (R2 com fallback automático para D1)
      if (path === '/api/admin/upload' && request.method === 'POST') {
        const user = await resolveAuthUser();
        if (!user) return json({ message: 'Não autenticado.' }, 401);
        if (!canAccessEntity(user.role, 'media', 'write')) return json({ message: 'Sem permissão.' }, 403);

        const formData = await request.formData().catch(() => null);
        const file = formData ? formData.get('file') : null;
        if (!file || typeof file === 'string') {
          return json({ message: 'Ficheiro não fornecido.' }, 422);
        }

        const buffer = await file.arrayBuffer();
        const id = crypto.randomUUID();
        const cleanName = encodeURIComponent(file.name.replace(/[^a-zA-Z0-9._-]/g, '_'));
        let finalUrl = '';

        if (env.ASSETS_R2) {
          const r2Key = `${id}/${cleanName}`;
          await env.ASSETS_R2.put(r2Key, buffer, {
            httpMetadata: {
              contentType: file.type || 'image/jpeg',
            },
          });
          finalUrl = `/uploads/${r2Key}`;
        } else {
          const bytes = new Uint8Array(buffer);
          let binary = '';
          for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          finalUrl = `data:${file.type || 'image/jpeg'};base64,${btoa(binary)}`;
        }

        const mediaRecord = {
          id,
          filename: file.name,
          originalName: file.name,
          mimeType: file.type || 'image/jpeg',
          url: finalUrl,
          size: file.size,
          category: 'Geral',
          createdAt: new Date().toISOString(),
        };

        if (db) {
          try {
            await db
              .prepare('INSERT INTO media (id, filename, originalName, mimeType, url, size, category, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
              .bind(mediaRecord.id, mediaRecord.filename, mediaRecord.originalName, mediaRecord.mimeType, mediaRecord.url, mediaRecord.size, mediaRecord.category, mediaRecord.createdAt)
              .run();
          } catch (e) {
            console.error('D1 upload error:', e);
          }
        }

        return json(mediaRecord, 201);
      }

      // Admin CRUD for Entities
      const adminEntityMatch = path.match(/^\/api\/admin\/(courses|events|campaigns|news|leads|users|media|audit)(?:\/([^/]+))?$/);
      if (adminEntityMatch) {
        const user = await resolveAuthUser();
        if (!user) return json({ message: 'Não autenticado.' }, 401);
        const [, entity, id] = adminEntityMatch;

        if (request.method === 'GET') {
          if (!canAccessEntity(user.role, entity, 'read')) return json({ message: 'Sem permissão.' }, 403);
          if (db) {
            const orderCol = entity === 'courses' ? 'name ASC' : 'createdAt DESC';
            const res = await db.prepare(`SELECT * FROM ${entity} ORDER BY ${orderCol}`).all();
            const results = (res.results || []).map((r) => ({
              ...r,
              featured: r.featured !== undefined ? Boolean(r.featured) : undefined,
              active: r.active !== undefined ? Boolean(r.active) : undefined,
            }));
            return json(results);
          }
          return json(initialDb[entity] || []);
        }

        if (request.method === 'POST') {
          if (!canAccessEntity(user.role, entity, 'write')) return json({ message: 'Sem permissão.' }, 403);
          const body = await request.json().catch(() => ({}));
          const created = {
            id: crypto.randomUUID(),
            ...body,
            createdAt: new Date().toISOString(),
          };

          if (db) {
            try {
              const keys = Object.keys(created);
              const cols = keys.map((k) => `"${k}"`).join(', ');
              const placeholders = keys.map(() => '?').join(', ');
              const vals = keys.map((k) => {
                const v = created[k];
                if (typeof v === 'boolean') return v ? 1 : 0;
                return v ?? null;
              });

              await db.prepare(`INSERT INTO ${entity} (${cols}) VALUES (${placeholders})`).bind(...vals).run();

              // Insert Audit
              await db
                .prepare('INSERT INTO audit (id, userId, action, entity, entityId, createdAt) VALUES (?, ?, ?, ?, ?, ?)')
                .bind(crypto.randomUUID(), user.id, 'CREATE', entity, created.id, created.createdAt)
                .run();
            } catch (e) {
              console.error(`D1 insert ${entity} error:`, e);
              return json({ message: 'Erro ao guardar na base de dados: ' + e.message }, 500);
            }
          }

          return json(created, 201);
        }

        if (request.method === 'PUT' && id) {
          if (!canAccessEntity(user.role, entity, 'write')) return json({ message: 'Sem permissão.' }, 403);
          const body = await request.json().catch(() => ({}));

          if (db) {
            try {
              const fields = Object.keys(body).filter((k) => k !== 'id');
              if (fields.length) {
                const setClause = fields.map((k) => `"${k}" = ?`).join(', ');
                const vals = fields.map((k) => {
                  const v = body[k];
                  if (typeof v === 'boolean') return v ? 1 : 0;
                  return v ?? null;
                });
                await db.prepare(`UPDATE ${entity} SET ${setClause} WHERE id = ?`).bind(...vals, id).run();

                // Audit
                await db
                  .prepare('INSERT INTO audit (id, userId, action, entity, entityId, createdAt) VALUES (?, ?, ?, ?, ?, ?)')
                  .bind(crypto.randomUUID(), user.id, 'UPDATE', entity, id, new Date().toISOString())
                  .run();
              }
              const updated = await db.prepare(`SELECT * FROM ${entity} WHERE id = ?`).bind(id).first();
              return json(updated || body);
            } catch (e) {
              console.error(`D1 update ${entity} error:`, e);
              return json({ message: 'Erro ao atualizar registo: ' + e.message }, 500);
            }
          }

          return json(body);
        }

        if (request.method === 'DELETE' && id) {
          if (!canAccessEntity(user.role, entity, 'write') || (user.role === 'ATTENDANCE' && (entity === 'leads' || entity === 'users'))) {
            return json({ message: 'Sem permissão para eliminar este registo.' }, 403);
          }

          if (db) {
            try {
              await db.prepare(`DELETE FROM ${entity} WHERE id = ?`).bind(id).run();
              await db
                .prepare('INSERT INTO audit (id, userId, action, entity, entityId, createdAt) VALUES (?, ?, ?, ?, ?, ?)')
                .bind(crypto.randomUUID(), user.id, 'DELETE', entity, id, new Date().toISOString())
                .run();
            } catch (e) {
              console.error(`D1 delete ${entity} error:`, e);
              return json({ message: 'Erro ao eliminar: ' + e.message }, 500);
            }
          }

          return json({ deleted: true });
        }
      }

      return json({ message: 'Endpoint não encontrado.' }, 404);
    }

    return env.ASSETS.fetch(request);
  },
};
