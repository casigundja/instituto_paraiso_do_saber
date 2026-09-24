<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('portal_users', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('email')->unique();
            $table->string('name');
            $table->string('passwordHash');
            $table->string('role')->default('EDITOR');
            $table->boolean('active')->default(true);
            $table->dateTime('createdAt')->useCurrent();
            $table->dateTime('updatedAt')->useCurrent();
        });
        Schema::create('portal_courses', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('slug')->unique();
            $table->string('name');
            $table->text('description');
            $table->string('image')->nullable();
            $table->string('duration')->nullable();
            $table->string('modality')->nullable();
            $table->string('area')->nullable();
            $table->string('status')->default('ACTIVE');
            $table->boolean('featured')->default(false);
            $table->text('objectives')->nullable();
            $table->text('careerProfile')->nullable();
            $table->text('requirements')->nullable();
            $table->text('curriculum')->nullable();
            $table->string('schedule')->nullable();
            $table->string('location')->nullable();
            $table->string('metaTitle')->nullable();
            $table->string('metaDescription')->nullable();
            $table->dateTime('createdAt')->useCurrent();
            $table->dateTime('updatedAt')->useCurrent();
        });
        Schema::create('portal_events', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('slug')->unique();
            $table->string('title');
            $table->text('description');
            $table->string('image')->nullable();
            $table->string('video')->nullable();
            $table->dateTime('startsAt');
            $table->dateTime('endsAt')->nullable();
            $table->string('time')->nullable();
            $table->string('location')->nullable();
            $table->string('speaker')->nullable();
            $table->string('registrationUrl')->nullable();
            $table->string('status')->default('UPCOMING');
            $table->string('publication')->default('DRAFT');
            $table->dateTime('createdAt')->useCurrent();
        });
        Schema::create('portal_campaigns', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('title');
            $table->string('subtitle')->nullable();
            $table->string('description')->nullable();
            $table->string('image')->nullable();
            $table->string('video')->nullable();
            $table->string('buttonText')->nullable();
            $table->string('url')->nullable();
            $table->dateTime('startsAt')->nullable();
            $table->dateTime('endsAt')->nullable();
            $table->integer('order')->default(0);
            $table->string('pages')->default('home');
            $table->string('status')->default('DRAFT');
            $table->dateTime('createdAt')->useCurrent();
        });
        Schema::create('portal_news', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('slug')->unique();
            $table->string('title');
            $table->text('summary');
            $table->text('content');
            $table->string('image')->nullable();
            $table->string('video')->nullable();
            $table->string('author')->nullable();
            $table->string('category');
            $table->string('tags')->nullable();
            $table->string('status')->default('DRAFT');
            $table->dateTime('publishAt')->nullable();
            $table->string('metaTitle')->nullable();
            $table->string('metaDescription')->nullable();
            $table->dateTime('createdAt')->useCurrent();
            $table->dateTime('updatedAt')->useCurrent();
        });
        Schema::create('portal_media', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('filename');
            $table->string('originalName');
            $table->string('mimeType');
            $table->string('url');
            $table->integer('size');
            $table->string('category')->nullable();
            $table->dateTime('createdAt')->useCurrent();
        });
        Schema::create('portal_leads', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->string('phone');
            $table->string('whatsapp')->nullable();
            $table->string('email')->nullable();
            $table->string('course')->nullable();
            $table->string('municipality')->nullable();
            $table->string('notes')->nullable();
            $table->string('status')->default('NEW');
            $table->dateTime('createdAt')->useCurrent();
        });
        Schema::create('portal_settings', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->text('value');
            $table->dateTime('updatedAt')->useCurrent();
        });
        Schema::create('portal_sections', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('key')->unique();
            $table->string('title')->nullable();
            $table->string('description')->nullable();
            $table->string('image')->nullable();
            $table->string('video')->nullable();
            $table->string('buttonText')->nullable();
            $table->string('buttonUrl')->nullable();
            $table->boolean('enabled')->default(true);
            $table->integer('order')->default(0);
        });
        Schema::create('portal_audit', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('userId')->nullable();
            $table->string('action');
            $table->string('entity');
            $table->string('entityId')->nullable();
            $table->text('details')->nullable();
            $table->string('ip')->nullable();
            $table->dateTime('createdAt')->useCurrent();
        });
        Schema::create('portal_tokens', function (Blueprint $table) {
            $table->string('hash', 64)->primary();
            $table->string('userId')->index();
            $table->dateTime('expiresAt');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('portal_tokens');
        Schema::dropIfExists('portal_audit');
        Schema::dropIfExists('portal_sections');
        Schema::dropIfExists('portal_settings');
        Schema::dropIfExists('portal_leads');
        Schema::dropIfExists('portal_media');
        Schema::dropIfExists('portal_news');
        Schema::dropIfExists('portal_campaigns');
        Schema::dropIfExists('portal_events');
        Schema::dropIfExists('portal_courses');
        Schema::dropIfExists('portal_users');
    }
};
