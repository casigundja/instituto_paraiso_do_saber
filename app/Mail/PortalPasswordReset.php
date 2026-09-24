<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PortalPasswordReset extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public string $resetUrl) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Recuperação da palavra-passe — Paraíso do Saber');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.portal-password-reset', with: ['resetUrl' => $this->resetUrl]);
    }
}
