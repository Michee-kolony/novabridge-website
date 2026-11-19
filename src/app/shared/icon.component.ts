import { Component, Input } from '@angular/core';

/** Pictogrammes de la charte : trait 1,75 px, angles arrondis, accent or. */
@Component({
  selector: 'nb-icon',
  standalone: false,
  host: { class: 'inline-block shrink-0' },
  template: `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="h-full w-full" aria-hidden="true">
    @switch (name) {
      @case ('shield') { <path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4" [attr.stroke]="accent"/> }
      @case ('medical') { <rect x="4" y="4" width="16" height="16" rx="3"/><path d="M12 8v8M8 12h8" [attr.stroke]="accent"/> }
      @case ('shirt') { <path d="M8 3l-5 3 2 4 2-1v12h10V9l2 1 2-4-5-3a4 4 0 0 1-8 0z"/><path d="M10 13h4" [attr.stroke]="accent"/> }
      @case ('gift') { <rect x="3" y="9" width="18" height="12" rx="1.5"/><path d="M12 9v12M3 13h18"/><path d="M12 9c-2-4-6-4-6-1.5S10 9 12 9c2 0 6-.5 6-1.5S14 5 12 9z" [attr.stroke]="accent"/> }
      @case ('truck') { <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="2" [attr.stroke]="accent"/><circle cx="17" cy="18" r="2" [attr.stroke]="accent"/> }
      @case ('globe') { <circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/><circle cx="12" cy="12" r="1.5" [attr.fill]="accent" [attr.stroke]="accent"/> }
      @case ('clock') { <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2" [attr.stroke]="accent"/> }
      @case ('factory') { <path d="M3 21V10l6 3V10l6 3V6l6-3v18z"/><path d="M7 17h2M12 17h2M17 17h1" [attr.stroke]="accent"/> }
      @case ('brand') { <path d="M4 4h9l7 7-9 9-7-7z"/><circle cx="8.5" cy="8.5" r="1.5" [attr.stroke]="accent"/> }
      @case ('camera') { <path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.2" [attr.stroke]="accent"/> }
      @case ('box') { <path d="M21 8l-9-5-9 5 9 5z"/><path d="M3 8v8l9 5 9-5V8M12 13v8"/><path d="M7.5 5.5l9 5" [attr.stroke]="accent"/> }
      @case ('chat') { <path d="M4 5h16v11H9l-5 4z"/><path d="M8 10h8M8 13h5" [attr.stroke]="accent"/> }
      @case ('mail') { <rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6" [attr.stroke]="accent"/> }
      @case ('pin') { <path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5" [attr.stroke]="accent"/> }
      @case ('arrow') { <path d="M5 12h14M13 6l6 6-6 6"/> }
      @case ('check') { <path d="M5 12l5 5 9-10" [attr.stroke]="accent"/> }
      @case ('ship') { <path d="M3 17l2 4h14l2-4-9-3z"/><path d="M6 14V8h12v6M10 8V4h4v4" /><path d="M2 21h20" [attr.stroke]="accent"/> }
      @case ('plane') { <path d="M21 15l-8-4V5a1.5 1.5 0 0 0-3 0v6l-8 4v2l8-2v4l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-4l8 2z"/> }
      @case ('star') { <path d="M12 3l2 7 7 2-7 2-2 7-2-7-7-2 7-2z" [attr.stroke]="accent"/> }
      @case ('menu') { <path d="M4 7h16M4 12h16M4 17h16"/> }
      @case ('close') { <path d="M6 6l12 12M18 6L6 18"/> }
      @case ('dashboard') { <rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5" [attr.stroke]="accent"/> }
      @case ('file') { <path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 13h6M9 17h4" [attr.stroke]="accent"/> }
      @case ('megaphone') { <path d="M3 10v4h4l9 5V5L7 10z"/><path d="M19 9a4 4 0 0 1 0 6" [attr.stroke]="accent"/><path d="M7 14l1.5 6"/> }
      @case ('grid') { <rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5" [attr.stroke]="accent"/> }
      @case ('settings') { <circle cx="12" cy="12" r="3" [attr.stroke]="accent"/><path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1"/> }
      @case ('logout') { <path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/> }
      @case ('external') { <path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/> }
      @case ('trash') { <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/> }
      @case ('edit') { <path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13 7l4 4" [attr.stroke]="accent"/> }
      @case ('eye') { <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3" [attr.stroke]="accent"/> }
      @case ('plus') { <path d="M12 5v14M5 12h14"/> }
      @case ('sock') { <path d="M8 3h7v8.5l3.6 3.4a3.2 3.2 0 0 1-4.4 4.6L8 13.6z"/><path d="M8 7h7" [attr.stroke]="accent"/><path d="M11.5 17l1.5 1.4" [attr.stroke]="accent"/> }
      @case ('chevron-up') { <path d="M6 15l6-6 6 6"/> }
      @case ('arrow-up') { <path d="M12 19V5M6 11l6-6 6 6"/> }
      @case ('cookie') { <path d="M12 3a9 9 0 1 0 9 9 3 3 0 0 1-3.5-3A3 3 0 0 1 14 5.5 3 3 0 0 1 12 3z"/><circle cx="8.5" cy="10" r=".9" [attr.stroke]="accent"/><circle cx="10" cy="15.5" r=".9" [attr.stroke]="accent"/><circle cx="15" cy="14" r=".9" [attr.stroke]="accent"/> }
      @case ('search') { <circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4" [attr.stroke]="accent"/> }
      @default { <circle cx="12" cy="12" r="9"/> }
    }
  </svg>`,
})
export class IconComponent {
  @Input({ required: true }) name!: string;
  @Input() accent = '#C9A24B';
}
