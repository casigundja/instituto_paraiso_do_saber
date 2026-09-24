<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\TestCase;

class PortalTest extends TestCase
{
    use RefreshDatabase;

    private function token(string $role = 'ADMIN'): string
    {
        DB::table('portal_users')->insert(['id' => (string) Str::uuid(), 'name' => 'Tester', 'email' => strtolower($role).'@example.test', 'passwordHash' => Hash::make('test-password'), 'role' => $role, 'active' => true]);

        return $this->postJson('/api/auth/login', ['email' => strtolower($role).'@example.test', 'password' => 'test-password'])->assertOk()->assertJsonMissingPath('user.passwordHash')->json('token');
    }

    public function test_public_leads_are_validated_and_persisted(): void
    {
        $this->postJson('/api/public/leads', [])->assertUnprocessable();
        $this->postJson('/api/public/leads', ['name' => 'Maria', 'phone' => '+244900000000', 'status' => 'ENROLLED'])->assertCreated()->assertJsonPath('status', 'NEW');
        $this->assertDatabaseHas('portal_leads', ['name' => 'Maria', 'status' => 'NEW']);
        $this->getJson('/api/admin/leads')->assertUnauthorized();
    }

    public function test_crud_publication_and_audit(): void
    {
        $this->withToken($this->token());
        $course = $this->postJson('/api/admin/courses', ['name' => 'Curso de teste', 'description' => 'Descrição', 'status' => 'ACTIVE', 'featured' => 'true'])->assertCreated()->json();
        $this->getJson('/api/public/courses/'.$course['slug'])->assertOk()->assertJsonPath('featured', true);
        $this->putJson('/api/admin/courses/'.$course['id'], ['status' => 'INACTIVE'])->assertOk();
        $this->getJson('/api/public/courses/'.$course['slug'])->assertNotFound();
        $this->deleteJson('/api/admin/courses/'.$course['id'])->assertOk();
        $this->assertDatabaseHas('portal_audit', ['entity' => 'courses', 'action' => 'DELETE']);
        $news = $this->postJson('/api/admin/news', ['title' => 'Agendada', 'summary' => 'Resumo', 'content' => 'Texto', 'category' => 'Institucional', 'status' => 'SCHEDULED', 'publishAt' => now()->subMinute()->toIso8601String()])->assertCreated()->json();
        $this->getJson('/api/public/news/'.$news['slug'])->assertOk();
        $this->putJson('/api/admin/news/'.$news['id'], ['publishAt' => now()->addDay()->toIso8601String()])->assertOk();
        $this->getJson('/api/public/news/'.$news['slug'])->assertNotFound();
    }

    public function test_roles_settings_upload_and_logout(): void
    {
        Storage::fake('public');
        $this->withToken($this->token('EDITOR'));
        $this->getJson('/api/admin/users')->assertForbidden();
        $this->putJson('/api/admin/settings', ['phone1' => '123'])->assertForbidden();
        $media = $this->postJson('/api/admin/upload', ['file' => UploadedFile::fake()->create('guide.pdf', 10, 'application/pdf')])->assertCreated()->json();
        Storage::disk('public')->assertExists('media/'.$media['filename']);
        $this->deleteJson('/api/admin/media/'.$media['id'])->assertOk();
        Storage::disk('public')->assertMissing('media/'.$media['filename']);
        $this->postJson('/api/auth/logout')->assertOk();
        $this->getJson('/api/auth/me')->assertUnauthorized();
        $this->withToken($this->token('ADMIN'));
        $this->putJson('/api/admin/settings', ['phone1' => '123'])->assertOk()->assertJsonPath('phone1', '123');
        $this->getJson('/api/public/home')->assertOk()->assertJsonPath('settings.phone1', '123');
    }

    public function test_attendance_updates_leads_and_exports_csv(): void
    {
        $id = $this->postJson('/api/public/leads', ['name' => '=SUM(1)', 'phone' => '123'])->assertCreated()->json('id');
        $this->withToken($this->token('ATTENDANCE'));
        $this->putJson('/api/admin/leads/'.$id, ['status' => 'CONTACTED'])->assertOk();
        $this->getJson('/api/admin/courses')->assertForbidden();
        $this->deleteJson('/api/admin/leads/'.$id)->assertForbidden();
        $response = $this->get('/api/admin/leads/export.csv')->assertOk();
        $this->assertStringContainsString("'=SUM(1)",$response->streamedContent());
    }
}
