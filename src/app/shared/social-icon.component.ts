import { Component, Input } from '@angular/core';

/** Logos simplifiés des réseaux sociaux (couleur = currentColor). */
@Component({
  selector: 'nb-social-icon',
  standalone: false,
  host: { class: 'inline-block shrink-0' },
  template: `
  <svg viewBox="0 0 24 24" class="h-full w-full" aria-hidden="true">
    @switch (name) {
      @case ('facebook') { <path fill="currentColor" d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21z"/> }
      @case ('instagram') {
        <g fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/></g>
        <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor"/>
      }
      @case ('linkedin') { <path fill="currentColor" d="M4.5 9h3.3v10.5H4.5zM6.15 3.8a1.9 1.9 0 1 1 0 3.8 1.9 1.9 0 0 1 0-3.8zM10 9h3.2v1.45h.05c.45-.85 1.55-1.75 3.2-1.75 3.4 0 4.05 2.25 4.05 5.15v5.65h-3.3v-5c0-1.2 0-2.75-1.7-2.75s-1.95 1.3-1.95 2.65v5.1H10z"/> }
      @case ('tiktok') { <path fill="currentColor" d="M16.6 3c.35 2.1 1.6 3.45 3.65 3.6v3.05a6.9 6.9 0 0 1-3.6-1.1v6.05A5.6 5.6 0 1 1 11 9v3.15a2.5 2.5 0 1 0 2.45 2.45V3z"/> }
      @case ('x') { <path fill="currentColor" d="M17.6 3.5h2.95l-6.45 7.35 7.6 9.65h-5.95l-4.65-6-5.35 6H2.8l6.9-7.85L2.4 3.5h6.1l4.2 5.5zm-1.05 15.3h1.65L7.55 5.1H5.8z"/> }
      @case ('youtube') { <path fill="currentColor" fill-rule="evenodd" d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3z"/> }
      @case ('whatsapp') {
        <path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" d="M3.5 20.5l1.3-4.2a8.5 8.5 0 1 1 3 2.9z"/>
        <path fill="currentColor" d="M9.3 7.6c.2 0 .4 0 .55.4l.75 1.75c.07.17.03.36-.08.5l-.55.65c-.1.12-.12.3-.04.44a6 6 0 0 0 2.8 2.55c.15.07.32.03.43-.09l.7-.8c.13-.15.34-.2.52-.12l1.75.8c.2.1.32.3.3.52-.1 1-.95 1.75-2 1.75A6.9 6.9 0 0 1 7.6 9.4c0-1 .75-1.8 1.7-1.8z"/>
      }
      @case ('phone') { <path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" d="M5 4h3.5l1.7 4.3-2.2 1.4a11 11 0 0 0 6.3 6.3l1.4-2.2L20 15.5V19a1.5 1.5 0 0 1-1.6 1.5A16.5 16.5 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4z"/> }
    }
  </svg>`,
})
export class SocialIconComponent {
  @Input({ required: true }) name!: string;
}
