import { content } from './content';
import type { NavSource } from './nav';

/** The pages in the nav and the footer. Ozlo only appears while its switch is on. */
export function navSources(): NavSource[] {
  return [
    { label: 'Acting', enabled: true, page: 'acting' },
    { label: 'Voice-over', enabled: true, page: 'voice-over' },
    { label: 'Puppeteering', enabled: true, page: 'puppeteering' },
    { label: 'About', enabled: true, page: 'about' },
    { label: 'Ozlo', enabled: content.ozlo().show, page: 'ozlo' },
    { label: 'Contact', enabled: true, page: 'contact', variant: 'button' },
  ];
}
