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
        $password = env('ADMIN_PASSWORD', 'admin123456');
        if (! DB::table('portal_users')->where('email', $email)->exists()) {
            DB::table('portal_users')->insert(['id' => (string) Str::uuid(), 'email' => $email, 'name' => 'Administrador Principal', 'passwordHash' => Hash::make($password), 'role' => 'ADMIN', 'active' => true]);
        }
        $defaultProfiles = [
            ['email' => 'editor@paraisodosaber.ao', 'name' => 'Editor de Conteúdos', 'role' => 'EDITOR', 'password' => env('EDITOR_PASSWORD', 'editor123456')],
            ['email' => 'secretaria@paraisodosaber.ao', 'name' => 'Atendimento / Secretaria', 'role' => 'ATTENDANCE', 'password' => env('ATTENDANCE_PASSWORD', 'secretaria123456')],
        ];
        foreach ($defaultProfiles as $p) {
            DB::table('portal_users')->updateOrInsert(
                ['email' => $p['email']],
                [
                    'id' => DB::table('portal_users')->where('email', $p['email'])->value('id') ?: (string) Str::uuid(),
                    'name' => $p['name'],
                    'passwordHash' => Hash::make($p['password']),
                    'role' => $p['role'],
                    'active' => true,
                ]
            );
        }
        $coursesSeed = [
            [
                'slug' => 'enfermagem',
                'name' => 'Enfermagem',
                'description' => 'Formação técnica e humanizada para prestar cuidados integrados de saúde, assistência ao paciente e promoção do bem-estar em unidades de saúde e comunidades.',
                'image' => '/banner1.jpeg',
                'duration' => '4 Anos (10ª à 13ª Classe)',
                'modality' => 'Presencial',
                'area' => 'Saúde',
                'featured' => true,
                'schedule' => 'Manhã: 07h00 - 12h30 | Tarde: 12h45 - 18h00 | Pós-Laboral: 18h00 - 21h30',
                'location' => 'Instalações do Instituto — Bairro Paraíso, Luanda',
                'objectives' => 'Formar profissionais de enfermagem com sólidas competências técnico-científicas e humanistas para prestar assistência directa ao paciente, atuar na promoção, prevenção, tratamento e reabilitação da saúde nos diversos níveis do Sistema Nacional de Saúde de Angola.',
                'careerProfile' => 'O Técnico de Enfermagem pode desempenhar funções em Hospitais Centrais e Provinciais, Centros e Postos de Saúde municipais, Clínicas privadas, Serviços de Urgência/Emergência e Cuidados Comunitários de Saúde em Angola.',
                'requirements' => 'Certificado de habilitações do I Ciclo do Ensino Secundário (9ª classe concluída), Cópia do Bilhete de Identidade, 4 fotografias tipo passe recentes, Atestado Médico oficial e Ficha de Inscrição preenchida na secretaria.',
                'curriculum' => 'Disciplinas de Formação Geral e Específica: Anatomia e Fisiologia Humana, Fundamentos de Enfermagem, Microbiologia e Parasitologia, Farmacologia Clínica, Saúde Pública e Epidemiologia, Enfermagem Médico-Cirúrgica, Saúde Materno-Infantil, Pediatria, Ética e Deontologia Profissional, e Estágio Curricular Supervisionado Hospitalar na 13ª classe.',
            ],
            [
                'slug' => 'analises-clinicas',
                'name' => 'Análises Clínicas',
                'description' => 'Capacitação prática para a realização de exames laboratoriais, colheita biológica e apoio fundamental ao diagnóstico clínico e patológico.',
                'image' => '/banner2.jpeg',
                'duration' => '4 Anos (10ª à 13ª Classe)',
                'modality' => 'Presencial',
                'area' => 'Saúde',
                'featured' => true,
                'schedule' => 'Manhã: 07h00 - 12h30 | Tarde: 12h45 - 18h00 | Pós-Laboral: 18h00 - 21h30',
                'location' => 'Instalações do Instituto — Bairro Paraíso, Luanda',
                'objectives' => 'Capacitar técnicos especializados na colheita de amostras biológicas, manuseamento de equipamentos laboratoriais, realização e interpretação de análises microbiológicas, hematológicas e bioquímicas para auxílio ao diagnóstico médico.',
                'careerProfile' => 'O Técnico de Análises Clínicas atua em Laboratórios de Análises Clínicas hospitalares públicos e privados, Bancos de Sangue, Centros de Diagnóstico, Institutos de Investigação Biomédica e Centros de Saúde em Angola.',
                'requirements' => 'Certificado do I Ciclo do Ensino Secundário (9ª classe concluída), Cópia do Bilhete de Identidade, 4 fotografias tipo passe, Atestado Médico e Ficha de Matrícula preenchida na secretaria do Instituto.',
                'curriculum' => 'Biologia Celular e Genética, Química Orgânica e Inorgânica, Hematologia Laboratorial, Bioquímica Clínica, Imunologia e Serologia, Parasitologia e Urinálise, Microbiologia Médica, Biossegurança e Gestão da Qualidade Laboratorial, com Estágio Prático e Hospitalar supervisionado.',
            ],
            [
                'slug' => 'farmacia',
                'name' => 'Farmácia',
                'description' => 'Formação profissional para promover o uso seguro e responsável dos medicamentos, manipulação farmacêutica e gestão de farmácias hospitalares e comunitárias.',
                'image' => '/media/courses/farmacia.jpg',
                'duration' => '4 Anos (10ª à 13ª Classe)',
                'modality' => 'Presencial',
                'area' => 'Saúde',
                'featured' => true,
                'schedule' => 'Manhã: 07h00 - 12h30 | Tarde: 12h45 - 18h00 | Pós-Laboral: 18h00 - 21h30',
                'location' => 'Instalações do Instituto — Bairro Paraíso, Luanda',
                'objectives' => 'Qualificar técnicos aptos a atuar no armazenamento, controlo de stocks, manipulação, dispensa e aconselhamento sobre o uso racional e seguro de medicamentos e produtos de saúde, de acordo com a legislação farmacêutica angolana.',
                'careerProfile' => 'O Técnico de Farmácia atua em Farmácias Hospitalares públicas e privadas, Farmácias Comunitárias, Depósitos de Medicamentos, Distribuidoras de Produtos Farmacêuticos e Serviços de Saúde Pública em Angola.',
                'requirements' => 'Certificado de conclusão da 9ª classe (I Ciclo), Cópia do Bilhete de Identidade, 4 fotos tipo passe, Atestado Médico e Confirmação de inscrição presencial.',
                'curriculum' => 'Química Farmacêutica, Farmacologia Geral e Aplicada, Farmacotécnica e Manipulação, Botânica e Farmacognosia, Toxicologia, Legislação e Deontologia Farmacêutica, Gestão e Armazenamento Farmacêutico, e Estágio Curricular Supervisionado em Farmácia Hospitalar e Comunitária.',
            ],
            [
                'slug' => 'fisioterapia',
                'name' => 'Fisioterapia',
                'description' => 'Formação para apoiar a reabilitação física, o movimento, a prevenção de incapacidades e a promoção da qualidade de vida dos pacientes.',
                'image' => '/media/courses/fisioterapia.jpg',
                'duration' => '4 Anos (10ª à 13ª Classe)',
                'modality' => 'Presencial',
                'area' => 'Saúde',
                'featured' => true,
                'schedule' => 'Manhã: 07h00 - 12h30 | Tarde: 12h45 - 18h00 | Pós-Laboral: 18h00 - 21h30',
                'location' => 'Instalações do Instituto — Bairro Paraíso, Luanda',
                'objectives' => 'Formar profissionais com competência técnica para executar planos terapêuticos de reabilitação motora, recuperação funcional e prevenção de incapacidades físicas decorrentes de lesões, patologias neurológicas e ortopédicas.',
                'careerProfile' => 'O Técnico de Fisioterapia pode atuar em Serviços de Medicina Física e Reabilitação de Hospitais, Clínicas especializadas, Centros Desportivos, Unidades Geriátricas e Centros de Apoio Comunitário em Angola.',
                'requirements' => 'Certificado do I Ciclo do Ensino Secundário (9ª classe), Cópia do Bilhete de Identidade, 4 fotografias tipo passe, Atestado Médico de robustez física e Ficha de Matrícula preenchida.',
                'curriculum' => 'Anatomia e Biomecânica Humana, Cinesiologia, Recursos Eletrotermofototerapêuticos, Fisioterapia Músculo-Esquelética, Fisioterapia Neurológica, Fisioterapia Respiratória e Cardiovascular, Hidroterapia e Cinesioterapia, com Estágio Prático em Centros de Reabilitação.',
            ],
            [
                'slug' => 'estomatologia',
                'name' => 'Estomatologia / Medicina Dentária',
                'description' => 'Prepare-se para cuidar da saúde oral, atuando na prevenção, higiene bucal e assistência qualificada em procedimentos dentários e cirúrgicos.',
                'image' => '/media/courses/estomatologia.jpg',
                'duration' => '4 Anos (10ª à 13ª Classe)',
                'modality' => 'Presencial',
                'area' => 'Saúde',
                'featured' => true,
                'schedule' => 'Manhã: 07h00 - 12h30 | Tarde: 12h45 - 18h00 | Pós-Laboral: 18h00 - 21h30',
                'location' => 'Instalações do Instituto — Bairro Paraíso, Luanda',
                'objectives' => 'Capacitar técnicos para prestar assistência integral em saúde oral, executando ações de higiene bucal, apoio direto ao médico estomatologista/dentista nos procedimentos clínicos e cirúrgicos, e promoção da saúde oral comunitária.',
                'careerProfile' => 'O Técnico de Estomatologia desempenha atividades em Serviços de Estomatologia de Hospitais públicos e privados, Clínicas Dentárias, Consultórios Odontológicos e Programas de Saúde Oral Escolar em Angola.',
                'requirements' => 'Certificado da 9ª classe concluída (I Ciclo), Cópia do Bilhete de Identidade, 4 fotos tipo passe, Atestado Médico e Inscrição presencial na secretaria.',
                'curriculum' => 'Anatomia e Fisiologia Craniofacial e Dentária, Materiais Dentários, Patologia Oral, Microbiologia e Controlo de Infecção Odontológica, Técnicas de Assistência em Cirurgia e Dentisterica, Radiologia Oral, Saúde Oral Comunitária e Estágio Curricular Supervisionado Clínico.',
            ],
        ];
        foreach ($coursesSeed as $c) {
            DB::table('portal_courses')->updateOrInsert(
                ['slug' => $c['slug']],
                array_merge($c, [
                    'id' => DB::table('portal_courses')->where('slug', $c['slug'])->value('id') ?: (string) Str::uuid(),
                ])
            );
        }
        foreach ([
            'institutionName' => 'Instituto Técnico Privado de Saúde Paraíso do Saber',
            'phone1' => '+244 930 133 850',
            'phone2' => '+244 953 955 368',
            'whatsapp' => '244930133850',
            'facebook' => 'https://www.facebook.com/EFTSPARAISODOSABER',
            'instagram' => 'https://www.instagram.com/instituto_paraiso_do_saber',
            'address' => 'Bairro Paraíso, depois da Pracinha Nova, em frente à Casa do Partido do MPLA.',
            'logo' => '/logo_transparent.png',
        ] as $key => $value) {
            DB::table('portal_settings')->insertOrIgnore(compact('key', 'value'));
        }
        $sections = ['hero' => 'O seu futuro começa aqui.', 'enrollment' => 'Inscrições e matrículas abertas', 'courses' => 'Cursos em destaque', 'about' => 'Conheça o Paraíso do Saber', 'video' => 'Conheça o Instituto', 'events' => 'Próximos eventos', 'news' => 'Notícias do Instituto', 'gallery' => 'Galeria do Instituto'];
        $order = 0;
        foreach ($sections as $key => $title) {
            DB::table('portal_sections')->insertOrIgnore(['id' => (string) Str::uuid(), 'key' => $key, 'title' => $title, 'order' => $order++]);
        }

        $eventsSeed = [
            [
                'slug' => 'jornadas-cientificas-instituto-paraiso-do-saber',
                'title' => 'Jornadas Científicas do Instituto Paraíso do Saber',
                'description' => "Quem não senta para aprender, não levanta para ensinar. Nesse intervalo de 11 à 15 do mês em curso, tivemos dias ricos, uns mais que os outros!\n\nA toda a comunidade estudantil do Instituto Técnico Privado de Saúde Paraíso do Saber (técnicas/os, docentes, discentes, e interessadas/os em geral), o nosso sincero e caloroso agradecimento pelo envolvimento, dedicação e espírito de partilha.\n\nChegamos ao fim de mais um desafio com a realização bem-sucedida das nossas Jornadas Científicas, que foram extremamente proveitosas e enriquecedoras para todos os participantes. Com esta iniciativa, reafirmamos o compromisso de dar uma nova roupagem ao bairro e a todo o município de Cacuaco!\n\nEste rico país tem um destino e um nobre desafio a cumprir: fazer ciência com rigor e formar profissionais de saúde altamente qualificados e humanizados para se inserirem e transformarem positivamente a sociedade.",
                'image' => '/media/events/jornadas-cientificas-1.jpg',
                'video' => null,
                'startsAt' => '2026-11-11 08:30:00',
                'endsAt' => '2026-11-15 16:30:00',
                'time' => '08:30 às 16:30',
                'location' => 'Auditório Central e Laboratórios do Instituto — Cacuaco, Luanda',
                'speaker' => 'Docentes, Discentes e Especialistas em Ciências da Saúde',
                'registrationUrl' => 'https://www.facebook.com/EFTSPARAISODOSABER/posts/pfbid01FJ7zfcqNjt8BZN7pUCzascpUsHwfCk1uzN8MWfAi6Vz5wnaiGj7UJVJyyu7H4JCl',
                'status' => 'UPCOMING',
                'publication' => 'PUBLISHED',
                'publishAt' => '2026-10-31 08:00:00',
                'metaTitle' => 'Jornadas Científicas | Instituto Paraíso do Saber',
                'metaDescription' => 'Quem não senta para aprender, não levanta para ensinar. Acompanhe os momentos e resultados das Jornadas Científicas no Instituto Paraíso do Saber em Cacuaco.',
            ],
            [
                'slug' => 'inauguracao-da-quadra-desportiva-paraiso-do-saber',
                'title' => 'Inauguração da Quadra Desportiva Paraíso do Saber',
                'description' => "Quadra desportiva Paraíso do Saber, inaugurada com a presença de figuras emblemáticas do futebol Nacional de Angola: Fabrice Maieco Akwá, Alonso Kali e Zé Kalanga.\n\nAlém do conhecimento científico e da excelência na formação em saúde, promovemos o desporto e o bem-estar da nossa comunidade académica. As atividades desportivas geram saúde, disciplina e integração comunitária. Viva o Paraíso do Saber!",
                'image' => '/media/events/inauguracao-quadra-1.jpg',
                'video' => null,
                'startsAt' => '2026-11-20 09:00:00',
                'endsAt' => '2026-11-20 17:00:00',
                'time' => '09:00 às 17:00',
                'location' => 'Complexo Desportivo do Instituto Paraíso do Saber — Cacuaco, Luanda',
                'speaker' => 'Fabrice Maieco Akwá, Alonso Kali, Zé Kalanga e Direção do Instituto',
                'registrationUrl' => 'https://www.facebook.com/EFTSPARAISODOSABER/posts/pfbid0228J8J6BRVVWrF86sSkVaqxBJUkAzt1Nu7QMCF51ABtBk4LrdyFetggyExriZaACNl',
                'status' => 'UPCOMING',
                'publication' => 'PUBLISHED',
                'publishAt' => '2026-10-31 08:00:00',
                'metaTitle' => 'Inauguração da Quadra Desportiva | Paraíso do Saber',
                'metaDescription' => 'Inauguração da quadra desportiva com as lendas do futebol angolano Akwá, Kali e Zé Kalanga no Paraíso do Saber.',
            ],
            [
                'slug' => 'feira-do-inventor-ciencia-tecnologia-artes-cacuaco',
                'title' => 'Participação na Feira do Inventor: Ciência, Tecnologia e Inovação',
                'description' => "Ninguém nesta vida sabe tudo, a cada dia que passa aprendemos sempre alguma coisa. Fé e determinação, vocês irão alcançar aquilo que são os vossos objetivos!\n\nO Instituto Técnico Privado de Saúde Paraíso do Saber participou com sucesso na 4.ª Edição da Feira do Inventor – Ciência, Tecnologia e Artes, realizada no Município de Cacuaco.\n\nFoi uma experiência enriquecedora que permitiu aos nossos docentes e discentes apresentar ideias inovadoras na área da saúde, promover o conhecimento científico aplicado e reforçar o compromisso com a educação de excelência e transformação social em Angola.",
                'image' => '/media/events/feira-inventor-1.jpg',
                'video' => null,
                'startsAt' => '2026-11-25 09:00:00',
                'endsAt' => '2026-11-27 16:00:00',
                'time' => '09:00 às 16:00',
                'location' => 'Município de Cacuaco, Luanda — Pavilhão de Exposições e Inovação',
                'speaker' => 'Docentes e Estudantes Investigadores do Paraíso do Saber',
                'registrationUrl' => 'https://www.facebook.com/EFTSPARAISODOSABER/posts/pfbid0iisF2qAYa5mJwutTkuHBMLX5jjSe9FWYtmGWTpN1bVfyEWCxDx3v3XMxtXWtqTaUl',
                'status' => 'UPCOMING',
                'publication' => 'PUBLISHED',
                'publishAt' => '2026-10-31 08:00:00',
                'metaTitle' => 'Feira do Inventor em Cacuaco | Paraíso do Saber',
                'metaDescription' => 'Participação do Instituto Técnico Privado de Saúde Paraíso do Saber na Feira do Inventor, Ciência e Tecnologia em Cacuaco.',
            ],
            [
                'slug' => '2-feira-de-saude-combate-doencas-diarreicas-agudas',
                'title' => '2ª Feira de Saúde Comunitária: Combate às Doenças Diarreicas Agudas',
                'description' => "Ação comunitária de saúde pública e intervenção preventiva realizada no Bairro Paraíso, Cacuaco. Iniciativa com foco no combate e prevenção às Doenças Diarreicas Agudas (DDA), orientações de saneamento e biossegurança, e atendimento direto às famílias locais.\n\nActividade prática dinamizada pelos estudantes dos cursos técnicos de Enfermagem, Análises Clínicas e Farmácia, sob supervisão do corpo docente e técnico do Instituto.\n\n#FeiraDeSaúde #Prevenção #DoençasDiarreicas #SaúdeParaTodos #CuidarParaViver",
                'image' => '/media/events/feira-saude-1.jpg',
                'video' => null,
                'startsAt' => '2026-11-28 08:00:00',
                'endsAt' => '2026-11-28 14:00:00',
                'time' => '08:00 às 14:00',
                'location' => 'Bairro Paraíso, Cacuaco — Posto Comunitário de Saúde',
                'speaker' => 'Estudantes Técnicos e Supervisores Clínicos do Paraíso do Saber',
                'registrationUrl' => 'https://www.facebook.com/EFTSPARAISODOSABER/videos/778649844170276/',
                'status' => 'UPCOMING',
                'publication' => 'PUBLISHED',
                'publishAt' => '2026-10-31 08:00:00',
                'metaTitle' => '2ª Feira de Saúde Comunitária | Paraíso do Saber',
                'metaDescription' => 'Combate às Doenças Diarreicas Agudas e promoção da saúde pública no Município de Cacuaco.',
            ],
            [
                'slug' => 'campeonato-intercolegial-paraiso-do-saber',
                'title' => 'Campeonato Intercolegial: Desporto, União e Superação',
                'description' => "Sejam todos bem-vindos ao Campeonato Intercolegial do Instituto Técnico Privado de Saúde Paraíso do Saber!\n\nMais do que desporto, celebramos união, superação, saúde e espírito de equipa entre os nossos alunos e colégios parceiros de Cacuaco.\n\nQue as partidas sejam marcadas pelo respeito mútuo, Fair Play e pela alegria saudável de competir. Que vença o melhor! Ensino com rigor, rumo à excelência.",
                'image' => '/media/events/campeonato-intercolegial-1.jpg',
                'video' => null,
                'startsAt' => '2026-12-05 08:30:00',
                'endsAt' => '2026-12-07 17:00:00',
                'time' => '08:30 às 17:00',
                'location' => 'Quadra Desportiva Paraíso do Saber — Bairro Paraíso, Cacuaco',
                'speaker' => 'Coordenação Desportiva e Direção do Instituto',
                'registrationUrl' => 'https://www.facebook.com/EFTSPARAISODOSABER/posts/pfbid0d8jNsK7TAoswfq4rtm3A5QidTrEPELDdzqv6pUAyNoDhCDxmD43Zax8kjKosHfrnl',
                'status' => 'UPCOMING',
                'publication' => 'PUBLISHED',
                'publishAt' => '2026-10-31 08:00:00',
                'metaTitle' => 'Campeonato Intercolegial | Paraíso do Saber',
                'metaDescription' => 'Desporto, espírito de equipa e integração estudantil no Campeonato Intercolegial do Paraíso do Saber em Cacuaco.',
            ],
        ];

        foreach ($eventsSeed as $ev) {
            DB::table('portal_events')->updateOrInsert(
                ['slug' => $ev['slug']],
                array_merge($ev, [
                    'id' => DB::table('portal_events')->where('slug', $ev['slug'])->value('id') ?: (string) Str::uuid(),
                    'createdAt' => now(),
                ])
            );
        }

        DB::table('portal_media')->where('filename', 'like', 'jornadas-cientificas-%')->whereRaw("CAST(REPLACE(REPLACE(filename, 'jornadas-cientificas-', ''), '.jpg', '') AS INTEGER) > 10")->delete();

        for ($i = 1; $i <= 10; $i++) {
            $filename = "jornadas-cientificas-{$i}.jpg";
            $filePath = public_path("media/events/{$filename}");
            $size = file_exists($filePath) ? filesize($filePath) : 150000;
            $cat = $i <= 5 ? 'Jornadas Científicas' : 'Ciência e Inovação';
            DB::table('portal_media')->updateOrInsert(
                ['filename' => $filename],
                [
                    'id' => DB::table('portal_media')->where('filename', $filename)->value('id') ?: (string) Str::uuid(),
                    'originalName' => "Jornadas Científicas — Registo {$i}",
                    'mimeType' => 'image/jpeg',
                    'url' => "/media/events/{$filename}",
                    'size' => $size,
                    'category' => $cat,
                    'createdAt' => now(),
                ]
            );
        }

        foreach ([
            ['filename' => 'banner-fachada.jpg', 'originalName' => 'Banner Fachada Oficial — Instituto Paraíso do Saber', 'url' => '/banner-fachada.jpg', 'category' => 'Institucional'],
            ['filename' => 'banner-fachada-arte.jpg', 'originalName' => 'Arte Fachada 16:9 — Instituto Paraíso do Saber', 'url' => '/banner-fachada-arte.jpg', 'category' => 'Institucional'],
        ] as $bm) {
            $fp = public_path($bm['filename']);
            DB::table('portal_media')->updateOrInsert(
                ['filename' => $bm['filename']],
                [
                    'id' => DB::table('portal_media')->where('filename', $bm['filename'])->value('id') ?: (string) Str::uuid(),
                    'originalName' => $bm['originalName'],
                    'mimeType' => 'image/jpeg',
                    'url' => $bm['url'],
                    'size' => file_exists($fp) ? filesize($fp) : 450000,
                    'category' => $bm['category'],
                    'createdAt' => now(),
                ]
            );
        }
    }
}
