/**
 * Unsafe markdown → HTML for Cycle-4 SoftDev (`v1.2.0`).
 *
 * Intentionally does NOT HTML-escape input. Raw HTML in the source is passed
 * through; a few markdown constructs are expanded. Secure v2.2.0 must replace
 * this with a sanitizing renderer (or drop the MD path).
 */
export function unsafeMarkdownToHtml(source: string): string {
  let s = source.replace(/\r\n/g, '\n');

  // Fenced code blocks (content unescaped — XSS-friendly)
  s = s.replace(/```[\w]*\n([\s\S]*?)```/g, (_m, code: string) => `<pre><code>${code}</code></pre>`);

  // Headings
  s = s.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  s = s.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  s = s.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Bold / italic (naive)
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Inline code
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Links — href not sanitized (XSS / javascript: candy)
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Paragraph breaks
  s = s
    .split(/\n{2,}/)
    .map((block) => {
      const t = block.trim();
      if (!t) return '';
      if (/^<(h[1-3]|pre|ul|ol|blockquote|p|div|script|img|svg)/i.test(t)) return t;
      return `<p>${t.replace(/\n/g, '<br/>')}</p>`;
    })
    .join('\n');

  return s;
}
