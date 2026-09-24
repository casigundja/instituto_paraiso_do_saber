<?php

use App\Http\Controllers\PortalController as Portal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('health', fn () => ['status' => 'ok']);
Route::post('auth/login', [Portal::class, 'login'])->middleware('throttle:10,1');
Route::post('auth/password/forgot', [Portal::class, 'forgotPassword'])->middleware('throttle:3,60');
Route::post('auth/password/reset', [Portal::class, 'resetPassword'])->middleware('throttle:8,60');
Route::get('public/home', [Portal::class, 'home']);
Route::post('public/leads', [Portal::class, 'lead'])->middleware('throttle:20,1');
Route::get('public/{entity}/{slug?}', [Portal::class, 'publicList']);
Route::middleware('portal.auth')->group(function () {
    Route::get('auth/me', [Portal::class, 'me']);
    Route::post('auth/logout', [Portal::class, 'logout']);
    Route::get('admin/dashboard', [Portal::class, 'dashboard']);
    Route::get('admin/settings', [Portal::class, 'settings']);
    Route::put('admin/settings', [Portal::class, 'saveSettings']);
    Route::post('admin/upload', [Portal::class, 'upload']);
    Route::get('admin/leads/export.xlsx', [Portal::class, 'export']);
    Route::get('admin/leads/export.csv', [Portal::class, 'exportCsv']);
    Route::put('admin/home-sections/{id}', fn (Request $request, string $id) => app(Portal::class)->save($request, 'sections', $id));
    Route::get('admin/{entity}', [Portal::class, 'index']);
    Route::post('admin/{entity}', [Portal::class, 'save']);
    Route::put('admin/{entity}/{id}', [Portal::class, 'save']);
    Route::delete('admin/{entity}/{id}',[Portal::class, 'remove']);
});
