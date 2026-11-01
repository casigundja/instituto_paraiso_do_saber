<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

$schemas = json_decode(file_get_contents(config_path('portal-schema.json')), true);
$export = [];

foreach (array_keys($schemas) as $entity) {
    $rows = DB::table('portal_' . $entity)->get()->map(function ($row) use ($schemas, $entity) {
        $data = (array) $row;
        unset($data['passwordHash']);
        foreach ($schemas[$entity]['fields'] as $key => $type) {
            if (isset($data[$key]) && $type === 'Boolean') {
                $data[$key] = (bool) $data[$key];
            }
        }
        return $data;
    })->values()->all();
    $export[$entity] = $rows;
}

$export['settings'] = DB::table('portal_settings')->pluck('value', 'key')->all();

file_put_contents(__DIR__ . '/cloudflare-db.json', json_encode($export, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
echo "Exported SQLite snapshot to scripts/cloudflare-db.json\n";

