<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\PortalPageController;

Route::get('/media/{filename}', function (string $filename) {
    abort_unless(preg_match('/^[a-zA-Z0-9._-]+$/', $filename), 404);
    $path = 'media/'.$filename;
    $disk = Storage::disk('public');
    abort_unless($disk->exists($path), 404);
    if (config('filesystems.disks.public.driver') === 's3') {
        return redirect()->away($disk->url($path));
    }

    return response()->file($disk->path($path), ['X-Content-Type-Options' => 'nosniff']);
});
Route::get('/robots.txt', [PortalPageController::class, 'robots']);
Route::get('/sitemap.xml', [PortalPageController::class, 'sitemap']);
Route::get('/', [PortalPageController::class, 'show'])->defaults('page', 'home');
Route::get('/{page}/{slug?}', [PortalPageController::class, 'show'])->where('page', 'admin|cursos|eventos|noticias|galeria|instituto|matriculas|contactos|recuperar-senha|redefinir-senha');
