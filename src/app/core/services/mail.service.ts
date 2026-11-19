import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { COMPANY } from '../data/company';
import { ContactMessage, QuoteRequest } from '../models';

/**
 * Envoi des formulaires du site par e-mail, via FormSubmit (https://formsubmit.co) :
 * service gratuit, sans compte ni serveur à héberger.
 *
 * ⚠️ ACTIVATION (une seule fois) : au tout premier envoi, FormSubmit envoie un e-mail
 * « Confirm your email » à l'adresse ci-dessous. Cliquez sur le bouton d'activation ;
 * ensuite, chaque message du site arrive directement dans cette boîte.
 *
 * Astuce : après activation, FormSubmit fournit un identifiant aléatoire
 * (ex. « 8a7f3c… ») à utiliser à la place de l'adresse pour la masquer du code du site.
 */
export const MAIL_TO = COMPANY.email; // cedrickonia@novabridgeglobalsupply.com
const ENDPOINT = `https://formsubmit.co/ajax/${MAIL_TO}`;

@Injectable({ providedIn: 'root' })
export class MailService {
  private http = inject(HttpClient);

  /** Message du formulaire de contact. */
  sendContact(m: Pick<ContactMessage, 'name' | 'email' | 'subject' | 'message'>) {
    return this.send({
      _subject: `[NovaBridge – Contact] ${m.subject}`,
      _replyto: m.email,
      Name: m.name,
      Email: m.email,
      Subject: m.subject,
      Message: m.message,
    });
  }

  /** Demande de devis. */
  sendQuote(q: QuoteRequest) {
    return this.send({
      _subject: `[NovaBridge – Quote ${q.id}] ${q.quantity} × ${q.product} — ${q.company}`,
      _replyto: q.email,
      'Quote ID': q.id,
      Name: q.name,
      Company: q.company,
      Email: q.email,
      Phone: q.phone || '—',
      Country: q.country,
      'Product line': q.productLine,
      Product: q.product,
      Quantity: String(q.quantity),
      'Custom branding': q.branding ? 'Yes' : 'No',
      Delivery: q.delivery === 'express' ? 'Express (air)' : 'Standard (sea)',
      Message: q.message || '—',
    });
  }

  private async send(fields: Record<string, string>): Promise<void> {
    const res = await firstValueFrom(this.http.post<{ success?: string | boolean; message?: string }>(
      ENDPOINT,
      { ...fields, _template: 'table', _captcha: 'false' },
      { headers: { Accept: 'application/json' } },
    ));
    if (res && String(res.success) === 'false') throw new Error(res.message || 'FormSubmit error');
  }
}
