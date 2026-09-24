<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('portal_password_resets', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('tokenHash', 64);
            $table->dateTime('expiresAt');
            $table->dateTime('createdAt');
        });
        Schema::table('portal_events', function (Blueprint $table) {
            $table->dateTime('publishAt')->nullable();
            $table->string('metaTitle')->nullable();
            $table->string('metaDescription', 170)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('portal_events', function (Blueprint $table) {
            $table->dropColumn(['publishAt', 'metaTitle', 'metaDescription']);
        });
        Schema::dropIfExists('portal_password_resets');
    }
};
