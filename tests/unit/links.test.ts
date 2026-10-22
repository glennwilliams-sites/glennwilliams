import { describe, expect, it } from 'vitest';
import { displayHost, linkHref, rebaseHtml, telHref, withBase } from '../../src/lib/links';

describe('rebaseHtml', () => {
  it('prefixes root-relative links and images with the base', () => {
    expect(rebaseHtml('<a href="/contact/">Contact</a>', '/glennwilliams/')).toBe('<a href="/glennwilliams/contact/">Contact</a>');
    expect(rebaseHtml('<img src="/a.png">', '/glennwilliams')).toBe('<img src="/glennwilliams/a.png">');
  });

  it('leaves everything alone on the live domain (base "/")', () => {
    expect(rebaseHtml('<a href="/contact/">x</a>', '/')).toBe('<a href="/contact/">x</a>');
  });

  it('does not touch external, protocol-relative, anchor or mailto links', () => {
    const html = '<a href="https://a.com/x">a</a><a href="//cdn.a.com">b</a><a href="#x">c</a><a href="mailto:g@a.ca">d</a>';
    expect(rebaseHtml(html, '/glennwilliams/')).toBe(html);
  });

  it('leaves links that already carry the base unchanged', () => {
    const html = '<a href="/glennwilliams/contact/">x</a>';
    expect(rebaseHtml(html, '/glennwilliams/')).toBe(html);
  });

  it('handles single-quoted attributes the same way', () => {
    expect(rebaseHtml("<a href='/contact/'>x</a>", '/glennwilliams/')).toBe("<a href='/glennwilliams/contact/'>x</a>");
  });
});

describe('withBase', () => {
  it('prefixes site paths with the base', () => {
    expect(withBase('puppeteering/', '/')).toBe('/puppeteering/');
    expect(withBase('/puppeteering/', '/glennwilliams/')).toBe('/glennwilliams/puppeteering/');
    expect(withBase('puppeteering/', '/glennwilliams')).toBe('/glennwilliams/puppeteering/');
    expect(withBase('', '/glennwilliams')).toBe('/glennwilliams/');
  });

  it('never doubles a base the path already carries', () => {
    expect(withBase('/glennwilliams/work/', '/glennwilliams/')).toBe('/glennwilliams/work/');
    expect(withBase('/glennwilliams', '/glennwilliams/')).toBe('/glennwilliams');
    expect(withBase('/glennwilliams/work/', '/glennwilliams')).toBe('/glennwilliams/work/');
    expect(withBase('/work/', '/')).toBe('/work/');
    // A different folder that merely starts with the same letters still gets the base.
    expect(withBase('/glennwilliamsfoo/', '/glennwilliams/')).toBe('/glennwilliams/glennwilliamsfoo/');
  });

  it('leaves external, mail, phone and anchor links alone', () => {
    for (const href of ['https://imdb.com', 'mailto:glenn@glennwilliams.ca', 'tel:+16046870388', '#contact']) {
      expect(withBase(href, '/glennwilliams/')).toBe(href);
    }
  });
});

describe('telHref', () => {
  it('turns Glenn-style dotted numbers into tel: links', () => {
    expect(telHref('1.604.318.8104')).toBe('tel:+16043188104');
    expect(telHref('604-687-0388')).toBe('tel:+16046870388');
    expect(telHref('')).toBe('');
  });
});

describe('linkHref', () => {
  it('adds https:// to bare domains', () => {
    expect(linkHref('www.sfxstudio.com')).toBe('https://www.sfxstudio.com');
  });
  it('keeps full URLs', () => {
    expect(linkHref('https://resumes.actorsaccess.com/GlennWilliams')).toBe('https://resumes.actorsaccess.com/GlennWilliams');
  });
  it('treats /paths as pages on this site', () => {
    expect(linkHref('/puppeteering/', '/glennwilliams/')).toBe('/glennwilliams/puppeteering/');
  });
  it('returns empty for empty', () => {
    expect(linkHref('  ')).toBe('');
  });
});

describe('displayHost', () => {
  it('shows the bare host of a link', () => {
    expect(displayHost('https://www.example.com/a/b?c=1')).toBe('example.com');
    expect(displayHost('example.org/x')).toBe('example.org');
  });
  it('returns an empty string for an empty or unreadable link', () => {
    expect(displayHost('')).toBe('');
    expect(displayHost('mailto:a@b.ca')).toBe('');
  });
});
