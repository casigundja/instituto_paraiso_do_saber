<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use App\Mail\PortalPasswordReset;

class PortalController extends Controller
{
    private function schema(string $entity): array
    {
        $schemas = json_decode(file_get_contents(config_path('portal-schema.json')), true);
        abort_unless(isset($schemas[$entity]), 404);

        return $schemas[$entity];
    }

    private function table(string $entity)
    {
        $this->schema($entity);

        return DB::table('portal_'.$entity);
    }

    private function serialize(string $entity, $row): array
    {
        $data = (array) $row;
        unset($data['passwordHash']);
        foreach ($this->schema($entity)['fields'] as $key => $type) {
            if (isset($data[$key]) && $type === 'Boolean') {
                $data[$key] = (bool) $data[$key];
            }
        }

        return $data;
    }

    private function authorize(Request $request, string $entity): void
    {
        $role = $request->attributes->get('portalUser')->role;
        abort_unless($role === 'ADMIN' || ($role === 'EDITOR' && in_array($entity, ['courses', 'events', 'campaigns', 'news', 'media', 'sections'])) || ($role === 'ATTENDANCE' && $entity === 'leads'), 403, 'Sem permissão para esta área.');
    }

    private function audit(Request $request, string $action, string $entity, string $id): void
    {
        DB::table('portal_audit')->insert(['id' => (string) Str::uuid(), 'userId' => $request->attributes->get('portalUser')->id, 'action' => $action, 'entity' => $entity, 'entityId' => $id, 'ip' => $request->ip(), 'createdAt' => now()]);
    }

    public function login(Request $request)
    {
        $data = $request->validate(['email' => 'required|email', 'password' => 'required|string']);
        $user = $this->table('users')->where('email', strtolower($data['email']))->where('active', true)->first();
        abort_unless($user && Hash::check($data['password'], $user->passwordHash), 422, 'E-mail ou palavra-passe inválidos.');
        $token = Str::random(80);
        DB::table('portal_tokens')->insert(['hash' => hash('sha256', $token), 'userId' => $user->id, 'expiresAt' => now()->addHours(8)]);

        return ['token' => $token, 'user' => $this->serialize('users', $user)];
    }

    public function me(Request $request)
    {
        return $this->serialize('users', $request->attributes->get('portalUser'));
    }

    public function logout(Request $request)
    {
        DB::table('portal_tokens')->where('hash', hash('sha256', $request->bearerToken()))->delete();

        return ['success' => true];
    }

    public function forgotPassword(Request $request)
    {
        $data = $request->validate(['email' => 'required|email|max:255']);
        $email = strtolower($data['email']);
        $user = $this->table('users')->where('email', $email)->where('active', true)->first();
        if ($user) {
            $token = Str::random(64);
            DB::table('portal_password_resets')->updateOrInsert(['email' => $email], [
                'tokenHash' => hash('sha256', $token), 'expiresAt' => now()->addHour(), 'createdAt' => now(),
            ]);
            $url = url('/redefinir-senha').'?'.http_build_query(['email' => $email, 'token' => $token]);
            try {
                Mail::to($email)->send(new PortalPasswordReset($url));
            } catch (\Throwable $exception) {
                Log::error('Falha ao enviar recuperação de palavra-passe.', ['exception' => $exception::class]);
            }
        }

        return ['message' => 'Se a conta estiver activa, enviaremos uma ligação de recuperação para o e-mail informado.'];
    }

    public function resetPassword(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email|max:255', 'token' => 'required|string|min:32|max:128',
            'password' => ['required', 'confirmed', Password::min(12)->letters()->mixedCase()->numbers()],
        ]);
        $email = strtolower($data['email']);
        $reset = DB::table('portal_password_resets')->where('email', $email)->first();
        abort_unless($reset && Carbon::parse($reset->expiresAt)->isFuture() && hash_equals($reset->tokenHash, hash('sha256', $data['token'])), 422, 'A ligação de recuperação é inválida ou expirou.');
        $user = $this->table('users')->where('email', $email)->where('active', true)->first();
        abort_unless($user, 422, 'A ligação de recuperação é inválida ou expirou.');

        DB::transaction(function () use ($email, $user, $data) {
            $this->table('users')->where('id', $user->id)->update(['passwordHash' => Hash::make($data['password']), 'updatedAt' => now()]);
            DB::table('portal_tokens')->where('userId', $user->id)->delete();
            DB::table('portal_password_resets')->where('email', $email)->delete();
        });

        return ['message' => 'Palavra-passe actualizada. Já pode iniciar sessão.'];
    }

    private function published(string $entity)
    {
        $query = $this->table($entity);
        switch ($entity) {
            case 'courses': $query->where('status', 'ACTIVE')->orderByDesc('featured')->orderBy('name');
                break;
            case 'events': $query->where(function ($q) {
                $q->where('publication', 'PUBLISHED')->orWhere(function ($scheduled) {
                    $scheduled->where('publication', 'SCHEDULED')->whereNotNull('publishAt')->where('publishAt', '<=', now());
                });
            })->orderBy('startsAt');
                break;
            case 'news': $query->where(function ($q) {
                $q->where(function ($p) {
                    $p->where('status', 'PUBLISHED')->where(function ($d) {
                        $d->whereNull('publishAt')->orWhere('publishAt', '<=', now());
                    });
                })->orWhere(function ($p) {
                    $p->where('status', 'SCHEDULED')->whereNotNull('publishAt')->where('publishAt', '<=', now());
                });
            })->orderByDesc('publishAt');
                break;
            case 'campaigns': $query->whereIn('status', ['PUBLISHED', 'SCHEDULED'])->where(fn ($q) => $q->whereNull('startsAt')->orWhere('startsAt', '<=', now()))->where(fn ($q) => $q->whereNull('endsAt')->orWhere('endsAt', '>=', now()))->orderBy('order');
                break;
            case 'media': $query->where('mimeType', 'like', 'image/%')->orderByDesc('createdAt');
                break;
            default: abort(404);
        }

        return $query;
    }

    public function publicList(Request $request, string $entity, ?string $slug = null)
    {
        abort_unless(in_array($entity, ['courses', 'events', 'news', 'media']), 404);
        $query = $this->published($entity);
        if ($slug !== null) {
            abort_if($entity === 'media', 404);

            return $this->serialize($entity, $query->where('slug', $slug)->firstOrFail());
        }
        if ($entity === 'courses' && $request->filled('q')) {
            $query->where(fn ($q) => $q->where('name', 'like', '%'.$request->q.'%')->orWhere('area', 'like', '%'.$request->q.'%'));
        }

        return $query->get()->map(fn ($row) => $this->serialize($entity, $row));
    }

    public function home()
    {
        $data = [];
        foreach (['courses', 'events', 'news', 'campaigns'] as $entity) {
            $query = $this->published($entity);
            if ($entity === 'events') {
                $query->where('startsAt', '>=', now())->limit(4);
            }
            if ($entity === 'news') {
                $query->limit(3);
            }
            $data[$entity] = $query->get()->map(fn ($row) => $this->serialize($entity, $row));
        }
        $data['sections'] = $this->table('sections')->orderBy('order')->get()->map(fn ($row) => $this->serialize('sections', $row));
        $data['settings'] = $this->table('settings')->pluck('value', 'key');

        return $data;
    }

    public function lead(Request $request)
    {
        $data = $request->validate(['name' => 'required|string|max:255', 'phone' => 'required|string|max:60', 'whatsapp' => 'nullable|string|max:60', 'email' => 'nullable|email|max:255', 'course' => 'nullable|string|max:255', 'municipality' => 'nullable|string|max:255', 'notes' => 'nullable|string|max:10000']);
        $data += ['id' => (string) Str::uuid(), 'status' => 'NEW', 'createdAt' => now()];
        $this->table('leads')->insert($data);

        return response()->json($data, 201);
    }

    public function dashboard()
    {
        $data = [];
        foreach (['courses', 'events', 'campaigns', 'news'] as $entity) {
            $data[$entity] = $this->published($entity)->count();
        }
        $data['events'] = $this->published('events')->where('startsAt', '>=', now())->count();
        foreach (['leads', 'media'] as $entity) {
            $data[$entity] = $this->table($entity)->count();
        }

        return $data;
    }

    private function leadFilters($query, Request $request)
    {
        $request->validate(['from' => 'nullable|date', 'to' => 'nullable|date', 'status' => 'nullable|string', 'course' => 'nullable|string']);
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('course')) {
            $query->where('course', 'like', '%'.$request->course.'%');
        }
        if ($request->filled('from')) {
            $query->where('createdAt', '>=', Carbon::parse($request->from)->startOfDay());
        }
        if ($request->filled('to')) {
            $query->where('createdAt', '<=', Carbon::parse($request->to)->endOfDay());
        }

        return $query;
    }

    public function index(Request $request, string $entity)
    {
        $this->authorize($request, $entity);
        $query = $this->table($entity);
        if ($entity === 'leads') {
            $this->leadFilters($query, $request);
        }
        $query->orderBy($entity === 'sections' ? 'order' : 'createdAt', $entity === 'sections' ? 'asc' : 'desc');
        if ($entity === 'audit') {
            $query->limit(200);
        }

        return $query->get()->map(fn ($row) => $this->serialize($entity, $row));
    }

    public function save(Request $request, string $entity, ?string $id = null)
    {
        $this->authorize($request, $entity);
        abort_if(in_array($entity, ['audit', 'settings']) || ($entity === 'media' && ! $id), 403);
        $schema = $this->schema($entity);
        if ($id) {
            $this->table($entity)->where('id', $id)->firstOrFail();
        }
        $input = $request->all();
        if ($entity === 'media') {
            $input = array_intersect_key($input, array_flip(['originalName', 'category']));
        }
        foreach ($schema['fields'] as $key => $type) {
            if ($type === 'Boolean' && isset($input[$key])) {
                $input[$key] = filter_var($input[$key], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            }
            if ((isset($schema['defaults'][$key]) || in_array($type, ['Role', 'PublicationStatus', 'LeadStatus'])) && ($input[$key] ?? null) === null) {
                unset($input[$key]);
            }
        }
        if (isset($schema['fields']['slug']) && empty($input['slug']) && ($input['name'] ?? $input['title'] ?? null)) {
            $input['slug'] = Str::slug($input['name'] ?? $input['title']);
        }
        if (isset($input['email'])) {
            $input['email'] = strtolower($input['email']);
        }
        if (! $id) {
            $input = array_merge($schema['defaults'], $input);
        }
        $rules = [];
        foreach ($schema['fields'] as $key => $type) {
            if (in_array($key, ['id', 'createdAt', 'updatedAt', 'passwordHash']) || ($entity === 'media' && ! in_array($key, ['originalName', 'category']))) {
                continue;
            }
            $required = in_array($key, $schema['required']);
            $rules[$key] = [$required ? ($id ? 'sometimes' : 'required') : 'nullable'];
            if ($required) {
                $rules[$key][] = 'required';
            }
            $rules[$key][] = match ($type) {
                'Int' => 'integer','Boolean' => 'boolean','DateTime' => 'date',default => 'string'
            };
            if ($type === 'String') {
                $rules[$key][] = match ($key) { 'metaTitle' => 'max:70', 'metaDescription' => 'max:170', default => 'max:50000' };
            }
            if (in_array($key, ['slug', 'email', 'key'])) {
                $rules[$key][] = Rule::unique('portal_'.$entity, $key)->ignore($id);
            }
            if ($key === 'email') {
                $rules[$key][] = 'email';
            }
            if ($key === 'slug') {
                $rules[$key][] = 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/';
            }
            if ($type === 'Role') {
                $rules[$key][] = Rule::in(['ADMIN', 'EDITOR', 'ATTENDANCE']);
            }
            if ($type === 'PublicationStatus') {
                $rules[$key][] = Rule::in(['DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED']);
            }
            if ($type === 'LeadStatus') {
                $rules[$key][] = Rule::in(['NEW', 'CONTACTED', 'NEGOTIATING', 'ENROLLED', 'NOT_INTERESTED']);
            }
            if (in_array($key, ['image', 'video', 'url', 'buttonUrl', 'registrationUrl'])) {
                $rules[$key][] = 'regex:~^(?:/(?!/)|https?://|#)[^\s]*$~';
            }
        }
        if ($entity === 'users') {
            $rules['password'] = [$id ? 'nullable' : 'required', 'string', 'min:8', 'max:255'];
        }
        $data = validator($input, $rules)->validate();
        if ($entity === 'users') {
            if (! empty($data['password'])) {
                $data['passwordHash'] = Hash::make($data['password']);
            }
            unset($data['password']);
        }
        foreach ($data as $key => $value) {
            if (($schema['fields'][$key] ?? null) === 'DateTime' && $value) {
                $data[$key] = Carbon::parse($value)->utc()->format('Y-m-d H:i:s');
            }
        }
        if (isset($schema['fields']['updatedAt'])) {
            $data['updatedAt'] = now();
        }
        $creating = ! $id;
        $id ??= (string) Str::uuid();
        DB::transaction(function () use ($request, $entity, $data, $id, $creating) {
            if ($creating) {
                $this->table($entity)->insert($data + ['id' => $id]);
            } else {
                $this->table($entity)->where('id', $id)->update($data);
            }
            if ($entity === 'users' && ! $creating) {
                DB::table('portal_tokens')->where('userId', $id)->delete();
            }
            $this->audit($request, $creating ? 'CREATE' : 'UPDATE', $entity, $id);
        });

        return response()->json($this->serialize($entity, $this->table($entity)->where('id', $id)->first()), $creating ? 201 : 200);
    }

    public function remove(Request $request, string $entity, string $id)
    {
        $this->authorize($request, $entity);
        abort_if(in_array($entity, ['audit', 'settings']) || $request->attributes->get('portalUser')->role === 'ATTENDANCE', 403);
        $row = $this->table($entity)->where('id', $id)->firstOrFail();
        if ($entity === 'users') {
            abort_if($id === $request->attributes->get('portalUser')->id, 422, 'Não pode remover a própria conta.');
        }
        DB::transaction(function () use ($request, $entity, $id) {
            $this->table($entity)->where('id', $id)->delete();
            $this->audit($request, 'DELETE', $entity, $id);
            if ($entity === 'users') {
                DB::table('portal_tokens')->where('userId', $id)->delete();
            }
        });
        if ($entity === 'media') {
            Storage::disk('public')->delete('media/'.basename($row->filename));
        }

        return ['success' => true];
    }

    public function settings(Request $request)
    {
        abort_unless(in_array($request->attributes->get('portalUser')->role, ['ADMIN', 'EDITOR']), 403);

        return $this->table('settings')->pluck('value', 'key');
    }

    public function saveSettings(Request $request)
    {
        $this->authorize($request, 'settings');
        $data = $request->validate(['*' => 'nullable|string|max:10000']);
        DB::transaction(function () use ($data, $request) {
            foreach ($data as $key => $value) {
                $this->table('settings')->updateOrInsert(['key' => $key], ['value' => $value ?? '', 'updatedAt' => now()]);
            }$this->audit($request, 'UPDATE', 'settings', 'general');
        });

        return $this->settings($request);
    }

    public function upload(Request $request)
    {
        $this->authorize($request, 'media');
        $request->validate(['file' => 'required|file|max:102400|mimes:jpg,jpeg,png,gif,webp,avif,mp4,webm,mov,pdf']);
        $file = $request->file('file');
        $path = $file->store('media', 'public');
        $disk = Storage::disk('public');
        $url = config('filesystems.disks.public.driver') === 's3' ? $disk->url($path) : '/media/'.basename($path);
        $data = ['id' => (string) Str::uuid(), 'filename' => basename($path), 'originalName' => $file->getClientOriginalName(), 'mimeType' => $file->getMimeType(), 'url' => $url, 'size' => $file->getSize(), 'category' => 'Geral', 'createdAt' => now()];
        $this->table('media')->insert($data);
        $this->audit($request, 'CREATE', 'media', $data['id']);

        return response()->json($data, 201);
    }

    public function exportCsv(Request $request)
    {
        $this->authorize($request, 'leads');
        $rows = $this->leadFilters($this->table('leads'), $request)->orderByDesc('createdAt')->get();

        return response()->streamDownload(function () use ($rows) {
            $file = fopen('php://output', 'w');
            fwrite($file, "\xEF\xBB\xBF");
            fputcsv($file, ['Nome', 'Telefone', 'WhatsApp', 'E-mail', 'Curso', 'Município', 'Estado', 'Data'], ';', '"', '');
            foreach ($rows as $row) {
                $values = [];
                foreach (['name', 'phone', 'whatsapp', 'email', 'course', 'municipality', 'status', 'createdAt'] as $key) {
                    $value = (string) ($row->$key ?? '');
                    $values[] = preg_match('/^[=+@\-\t\r]/',$value) ? "'".$value : $value;
                }fputcsv($file,$values,';','"','');
            }fclose($file);
        }, 'interessados.csv', ['Content-Type' => 'text/csv; charset=utf-8']);
    }

    public function export(Request $request)
    {
        $this->authorize($request, 'leads');
        abort_unless(class_exists(\ZipArchive::class), 503, 'A extensão PHP ZIP é necessária para exportar Excel.');
        $rows = $this->leadFilters($this->table('leads'), $request)->orderByDesc('createdAt')->get();
        $headers = ['Nome', 'Telefone', 'WhatsApp', 'E-mail', 'Curso', 'Município', 'Estado', 'Data'];
        $keys = ['name', 'phone', 'whatsapp', 'email', 'course', 'municipality', 'status', 'createdAt'];
        $xml = static fn ($value) => htmlspecialchars((string) ($value ?? ''), ENT_XML1 | ENT_QUOTES, 'UTF-8');
        $col = static function (int $number): string { $name = ''; while ($number) { $number--; $name = chr(65 + ($number % 26)).$name; $number = intdiv($number, 26); } return $name; };
        $sheetRows = '<row r="1" ht="24" customHeight="1">';
        foreach ($headers as $i => $value) { $sheetRows .= '<c r="'.$col($i + 1).'1" t="inlineStr" s="1"><is><t>'.$xml($value).'</t></is></c>'; }
        $sheetRows .= '</row>';
        foreach ($rows as $index => $row) {
            $r = $index + 2; $sheetRows .= '<row r="'.$r.'">';
            foreach ($keys as $i => $key) { $value = $row->$key ?? ''; $sheetRows .= '<c r="'.$col($i + 1).$r.'" t="inlineStr"><is><t>'.$xml($value).'</t></is></c>'; }
            $sheetRows .= '</row>';
        }
        $lastRow = max(1, $rows->count() + 1);
        $sheet = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols><col min="1" max="1" width="28" customWidth="1"/><col min="2" max="4" width="22" customWidth="1"/><col min="5" max="6" width="24" customWidth="1"/><col min="7" max="8" width="18" customWidth="1"/></cols><sheetData>'.$sheetRows.'</sheetData><autoFilter ref="A1:H'.$lastRow.'"/></worksheet>';
        $path = tempnam(sys_get_temp_dir(), 'portal-leads-');
        $zip = new \ZipArchive();
        if ($zip->open($path, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) { @unlink($path); abort(500, 'Não foi possível criar o ficheiro Excel.'); }
        $zip->addFromString('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>');
        $zip->addFromString('_rels/.rels', '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');
        $zip->addFromString('xl/workbook.xml', '<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Interessados" sheetId="1" r:id="rId1"/></sheets></workbook>');
        $zip->addFromString('xl/_rels/workbook.xml.rels', '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>');
        $zip->addFromString('xl/styles.xml', '<?xml version="1.0" encoding="UTF-8"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Aptos"/></font><font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Aptos"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF174B43"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs></styleSheet>');
        $zip->addFromString('xl/worksheets/sheet1.xml', $sheet); $zip->close();

        return response()->download($path, 'interessados-'.now()->format('Ymd-His').'.xlsx', ['Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])->deleteFileAfterSend(true);
    }
}
