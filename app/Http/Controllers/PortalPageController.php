<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\URL;

class PortalPageController extends Controller
{
    public function show(Request $request, string $page = 'home', ?string $slug = null)
    {
        $name = 'Instituto Paraíso do Saber';
        $title = $name.' | Formação que transforma';
        $description = 'Conheça os cursos, eventos e actividades do Instituto Técnico Privado de Saúde Paraíso do Saber.';
        $image = URL::to('/banner1.jpeg');
        $canonical = URL::current();
        $settings = DB::table('portal_settings')->pluck('value', 'key');
        if (! $slug && $page === 'home') {
            $title = $settings['metaTitle'] ?? $title;
            $description = $settings['metaDescription'] ?? $description;
        }

        if ($page === 'cursos' && $slug) {
            $record = DB::table('portal_courses')->where('slug', $slug)->where('status', 'ACTIVE')->first();
            if ($record) {
                $title = ($record->metaTitle ?: $record->name).' | '.$name;
                $description = $record->metaDescription ?: $record->description;
                $image = $record->image ? URL::to(str_starts_with($record->image, '/') ? $record->image : '/'.$record->image) : $image;
            }
        } elseif ($page === 'noticias' && $slug) {
            $record = DB::table('portal_news')->where('slug', $slug)->where(function ($query) {
                $query->where(function ($published) {
                    $published->where('status', 'PUBLISHED')->where(function ($date) {
                        $date->whereNull('publishAt')->orWhere('publishAt', '<=', now());
                    });
                })->orWhere(function ($scheduled) {
                    $scheduled->where('status', 'SCHEDULED')->whereNotNull('publishAt')->where('publishAt', '<=', now());
                });
            })->first();
            if ($record) {
                $title = ($record->metaTitle ?: $record->title).' | '.$name;
                $description = $record->metaDescription ?: $record->summary;
                $image = $record->image ? URL::to(str_starts_with($record->image, '/') ? $record->image : '/'.$record->image) : $image;
            }
        } elseif ($page === 'eventos' && $slug) {
            $record = DB::table('portal_events')->where('slug', $slug)->where(function ($query) {
                $query->where('publication', 'PUBLISHED')->orWhere(function ($scheduled) {
                    $scheduled->where('publication', 'SCHEDULED')->whereNotNull('publishAt')->where('publishAt', '<=', now());
                });
            })->first();
            if ($record) {
                $title = ($record->metaTitle ?: $record->title).' | '.$name;
                $description = $record->metaDescription ?: $record->description;
                $image = $record->image ? URL::to(str_starts_with($record->image, '/') ? $record->image : '/'.$record->image) : $image;
            }
        } else {
            $pageTitles = [
                'admin' => 'Painel administrativo',
                'cursos' => 'Cursos',
                'eventos' => 'Eventos',
                'noticias' => 'Notícias',
                'galeria' => 'Galeria',
                'instituto' => 'O Instituto',
                'matriculas' => 'Matrículas',
                'contactos' => 'Contactos',
                'recuperar-senha' => 'Recuperar palavra-passe',
                'redefinir-senha' => 'Definir palavra-passe',
            ];
            if (isset($pageTitles[$page])) {
                $title = $pageTitles[$page].' | '.$name;
                $description = $pageTitles[$page].' — Instituto Técnico Privado de Saúde Paraíso do Saber.';
            }
            $pageMetaTitle = $settings['metaTitle_'.$page] ?? '';
            $pageMetaDescription = $settings['metaDescription_'.$page] ?? '';
            if ($pageMetaTitle !== '') {
                $title = $pageMetaTitle;
            }
            if ($pageMetaDescription !== '') {
                $description = $pageMetaDescription;
            }
        }

        $noindex = $page === 'admin' || in_array($page, ['recuperar-senha', 'redefinir-senha'], true);

        return view('portal', [
            'metaTitle' => $title,
            'metaDescription' => mb_substr(trim(strip_tags($description)), 0, 170),
            'metaImage' => $image,
            'canonicalUrl' => $canonical,
            'noindex' => $noindex,
        ]);
    }

    public function robots()
    {
        $body = "User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /recuperar-senha\nDisallow: /redefinir-senha\nSitemap: ".URL::to('/sitemap.xml')."\n";

        return response($body, 200, ['Content-Type' => 'text/plain; charset=UTF-8']);
    }

    public function sitemap()
    {
        $urls = [URL::to('/')];
        foreach (['cursos' => DB::table('portal_courses')->where('status', 'ACTIVE')->pluck('slug'),
            'noticias' => DB::table('portal_news')->whereIn('status', ['PUBLISHED', 'SCHEDULED'])->where(function ($query) {
                $query->whereNull('publishAt')->orWhere('publishAt', '<=', now());
            })->pluck('slug'),
            'eventos' => DB::table('portal_events')->where(function ($query) {
                $query->where('publication', 'PUBLISHED')->orWhere(function ($scheduled) {
                    $scheduled->where('publication', 'SCHEDULED')->whereNotNull('publishAt')->where('publishAt', '<=', now());
                });
            })->pluck('slug')] as $path => $slugs) {
            foreach ($slugs as $slug) {
                $urls[] = URL::to('/'.$path.'/'.rawurlencode($slug));
            }
        }

        return response()->view('sitemap', ['urls' => $urls])->header('Content-Type', 'application/xml; charset=UTF-8');
    }
}
