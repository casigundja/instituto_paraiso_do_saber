<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $email = env('ADMIN_EMAIL', 'admin@paraisodosaber.ao');
        if (! DB::table('portal_users')->where('email', $email)->exists()) {
            $password = env('ADMIN_PASSWORD');
            if (! $password) {
                throw new \RuntimeException('Configure ADMIN_PASSWORD no .env antes de executar db:seed.');
            }
            DB::table('portal_users')->insert(['id' => (string) Str::uuid(), 'email' => $email, 'name' => 'Administrador', 'passwordHash' => Hash::make($password), 'role' => 'ADMIN', 'active' => true]);
        }
        foreach ([
            ['farmacia', 'Farmácia', 'Formação profissional para promover o uso seguro e responsável dos medicamentos.', '/banner1.jpeg'],
            ['fisioterapia', 'Fisioterapia', 'Formação para apoiar a reabilitação, o movimento e a qualidade de vida.', '/banner2.jpeg'],
            ['estomatologia', 'Estomatologia / Medicina Dentária', 'Prepare-se para cuidar da saúde oral com competência e responsabilidade.', '/banner3.jpeg'],
        ] as [$slug,$name,$description,$image]) {
            if (! DB::table('portal_courses')->where('slug', $slug)->exists()) {
                DB::table('portal_courses')->insert(['id' => (string) Str::uuid(), 'slug' => $slug, 'name' => $name, 'description' => $description, 'image' => $image, 'area' => 'Saúde', 'featured' => true]);
            }
        }
        foreach (['institutionName' => 'Instituto Técnico Privado de Saúde Paraíso do Saber', 'phone1' => '+244 930 133 850', 'phone2' => '+244 953 955 368', 'whatsapp' => '244930133850', 'address' => 'Bairro Paraíso, depois da Pracinha Nova, em frente à Casa do Partido do MPLA.', 'logo' => '/logo_paraiso_do_saber.jpeg'] as $key => $value) {
            DB::table('portal_settings')->insertOrIgnore(compact('key', 'value'));
        }
        $sections = ['hero' => 'O seu futuro começa aqui.', 'enrollment' => 'Inscrições e matrículas abertas', 'courses' => 'Cursos em destaque', 'about' => 'Conheça o Paraíso do Saber', 'video' => 'Conheça o Instituto', 'events' => 'Próximos eventos', 'news' => 'Notícias do Instituto', 'gallery' => 'Galeria do Instituto'];
        $order = 0;
        foreach ($sections as $key => $title) {
            DB::table('portal_sections')->insertOrIgnore(['id' => (string) Str::uuid(), 'key' => $key, 'title' => $title, 'order' => $order++]);
        }
    }
}
