<?php

return [
    'disk' => env('BACKUP_DISK', 'local'),
    'path' => trim(env('BACKUP_PATH', 'backups/portal'), '/'),
    'retention_days' => max(1, (int) env('BACKUP_RETENTION_DAYS', 14)),
];
