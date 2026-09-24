<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use ZipArchive;

class PortalBackup extends Command
{
    protected $signature = 'portal:backup';
    protected $description = 'Cria e guarda uma cópia consistente da base de dados e da mídia do portal';

    public function handle(): int
    {
        if (DB::connection()->getDriverName() !== 'sqlite') {
            $this->error('Este comando de cópia está preparado para a base SQLite configurada neste portal.');
            return self::FAILURE;
        }

        $temp = storage_path('app/private/backup-'.bin2hex(random_bytes(8)));
        if (! is_dir($temp) && ! mkdir($temp, 0700, true) && ! is_dir($temp)) {
            $this->error('Não foi possível criar a pasta temporária protegida.');
            return self::FAILURE;
        }
        $snapshot = $temp.DIRECTORY_SEPARATOR.'database.sqlite';
        $archivePath = $temp.DIRECTORY_SEPARATOR.'portal-'.now()->format('Ymd-His').'.zip';
        try {
            DB::connection()->getPdo()->exec('VACUUM INTO '.DB::connection()->getPdo()->quote($snapshot));
            $archive = new ZipArchive();
            if ($archive->open($archivePath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
                throw new \RuntimeException('Não foi possível criar o arquivo ZIP.');
            }
            $archive->addFile($snapshot, 'database.sqlite');
            $archive->addFromString('manifest.json', json_encode([
                'created_at' => now()->toIso8601String(), 'application' => config('app.name'), 'database' => 'sqlite',
                'media_disk' => config('filesystems.disks.public.driver'),
            ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR));
            $media = Storage::disk('public');
            foreach ($media->allFiles('media') as $file) {
                $stream = $media->readStream($file);
                if (is_resource($stream)) {
                    $archive->addFromString($file, stream_get_contents($stream));
                    fclose($stream);
                }
            }
            $archive->close();

            $disk = Storage::disk(config('backups.disk'));
            $filename = basename($archivePath);
            $target = config('backups.path').'/'.$filename;
            $stream = fopen($archivePath, 'rb');
            try {
                if (! $disk->put($target, $stream)) {
                    throw new \RuntimeException('O armazenamento de cópias recusou o arquivo.');
                }
            } finally {
                if (is_resource($stream)) fclose($stream);
            }
            $cutoff = now()->subDays(config('backups.retention_days'))->timestamp;
            foreach ($disk->files(config('backups.path')) as $oldBackup) {
                if (str_ends_with($oldBackup, '.zip') && $disk->lastModified($oldBackup) < $cutoff) $disk->delete($oldBackup);
            }
            $this->info('Cópia guardada em '.$target.' no disco '.config('backups.disk').'.');
            return self::SUCCESS;
        } catch (\Throwable $exception) {
            report($exception);
            $this->error('A cópia falhou. Consulte os registos da aplicação.');
            return self::FAILURE;
        } finally {
            foreach (glob($temp.DIRECTORY_SEPARATOR.'*') ?: [] as $file) @unlink($file);
            @rmdir($temp);
        }
    }
}
