<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PortalAuth
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken();
        abort_unless($token, 401, 'Inicie sessão.');
        $session = DB::table('portal_tokens')->where('hash', hash('sha256', $token))->where('expiresAt', '>', now())->first();
        $user = $session ? DB::table('portal_users')->where('id', $session->userId)->where('active', true)->first() : null;
        abort_unless($user, 401, 'Sessão expirada.');
        $request->attributes->set('portalUser', $user);

        return $next($request);
    }
}
