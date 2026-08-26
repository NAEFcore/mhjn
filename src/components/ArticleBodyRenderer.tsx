import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';

interface ArticleBodyRendererProps {
  content: string;
  fontSize?: 'normal' | 'large' | 'xlarge';
  className?: string;
  adComponent?: React.ReactNode;
}

/**
 * Check if the string contains actual HTML structure tags
 */
export function isHtmlContent(raw: string): boolean {
  if (!raw) return false;
  return /<\/?(p|div|h[1-6]|figure|img|blockquote|ul|ol|li|table|a|span|section|article|strong|em|br|hr)\b/i.test(raw);
}

/**
 * Clean Gutenberg comments, normalize CDATA and HTML entity escapes
 */
export function prepareArticleHtml(raw: string): string {
  if (!raw) return '';

  let text = raw.trim();

  // 1. Remove CDATA wrapping if present
  if (text.startsWith('<![CDATA[') && text.endsWith(']]>')) {
    text = text.substring(9, text.length - 3);
  } else {
    text = text.replace(/<!\[CDATA\[/gi, '').replace(/\]\]>/gi, '');
  }

  // 2. Remove Gutenberg block comments: <!-- wp:... -->, <!-- /wp:... -->, <!-- wp:... /-->
  // Matches all single-line and multi-line Gutenberg comments with JSON or attributes
  text = text.replace(/<!--\s*\/?wp:[\w\-\/]+(?:\s+[\s\S]*?)?-->/gi, '');

  // 3. Remove standard HTML comments
  text = text.replace(/<!--(?![\s\S]*?-->)[\s\S]*?-->/g, '');

  // 4. If tags were escaped as &lt;p&gt; or &lt;figure&gt;, decode them into real HTML
  if (/&lt;(?:p|figure|img|h[1-6]|div|span|a|ul|ol|li|blockquote|table|strong|em|br|hr)\b/i.test(text)) {
    text = text
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&');
  }

  return text.trim();
}

/**
 * Configure DOMPurify hooks to enhance security and news styling
 */
function sanitizeAndEnhanceHtml(rawHtml: string): string {
  const cleaned = prepareArticleHtml(rawHtml);

  // Set up DOMPurify hook once for attributes
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    // Images: ensure referrer policy to avoid 403 Forbidden on remote CDNs
    if (node.nodeName === 'IMG') {
      node.setAttribute('referrerpolicy', 'no-referrer');
      node.setAttribute('loading', 'lazy');
      const existingClass = node.getAttribute('class') || '';
      if (!existingClass.includes('rounded')) {
        node.setAttribute('class', `${existingClass} rounded-xl border border-gray-200 shadow-xs my-2 max-w-full h-auto mx-auto block`.trim());
      }
    }

    // Links: ensure safe target and rel
    if (node.nodeName === 'A') {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
      const existingClass = node.getAttribute('class') || '';
      if (!existingClass.includes('text-')) {
        node.setAttribute('class', `${existingClass} text-[#0051a8] hover:text-[#003366] font-semibold underline underline-offset-3 transition-colors`.trim());
      }
    }

    // Figures: ensure proper styling
    if (node.nodeName === 'FIGURE') {
      const existingClass = node.getAttribute('class') || '';
      node.setAttribute('class', `${existingClass} my-6 space-y-2 block w-full text-center`.trim());
    }

    // Figcaptions: style as editorial photo caption
    if (node.nodeName === 'FIGCAPTION') {
      const existingClass = node.getAttribute('class') || '';
      node.setAttribute('class', `${existingClass} text-xs text-slate-500 font-serif-kr text-center italic mt-1.5`.trim());
    }
  });

  const sanitized = DOMPurify.sanitize(cleaned, {
    ALLOWED_TAGS: [
      'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
      'figure', 'figcaption', 'img', 'a', 
      'ul', 'ol', 'li', 'blockquote', 
      'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 
      'strong', 'b', 'em', 'i', 'u', 's', 'del', 'mark',
      'br', 'hr', 'span', 'div', 'code', 'pre', 'section', 'article', 'cite'
    ],
    ALLOWED_ATTR: [
      'src', 'srcset', 'sizes', 'href', 'alt', 'title', 
      'class', 'className', 'target', 'rel', 
      'width', 'height', 'style', 'referrerpolicy', 'align', 'loading'
    ],
    ADD_ATTR: ['target', 'rel', 'referrerpolicy', 'loading'],
  });

  // Remove hook to prevent duplicate triggers
  DOMPurify.removeHook('afterSanitizeAttributes');

  return sanitized;
}

/**
 * Split HTML into top-level blocks to inject in-body ad safely
 */
function splitHtmlBlocks(html: string): string[] {
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    // Server or fallback regex split
    return html.split(/(?=<(?:p|h[1-6]|figure|blockquote|table|ul|ol|div)\b)/i).filter(b => b.trim().length > 0);
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
    const container = doc.body.firstElementChild;
    if (!container || container.childNodes.length === 0) {
      return [html];
    }

    const blocks: string[] = [];
    Array.from(container.childNodes).forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        blocks.push((node as HTMLElement).outerHTML);
      } else if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
        blocks.push(`<p>${node.textContent.trim()}</p>`);
      }
    });

    return blocks.length > 0 ? blocks : [html];
  } catch {
    return [html];
  }
}

export const ArticleBodyRenderer: React.FC<ArticleBodyRendererProps> = ({
  content,
  fontSize = 'normal',
  className = '',
  adComponent,
}) => {
  const fontSizeClass = useMemo(() => {
    switch (fontSize) {
      case 'xlarge':
        return 'text-xl sm:text-2xl leading-loose';
      case 'large':
        return 'text-lg sm:text-xl leading-relaxed';
      case 'normal':
      default:
        return 'text-base sm:text-lg leading-loose';
    }
  }, [fontSize]);

  const sanitizedHtml = useMemo(() => {
    if (!content) return '';
    return sanitizeAndEnhanceHtml(content);
  }, [content]);

  const isHtml = useMemo(() => {
    return isHtmlContent(sanitizedHtml);
  }, [sanitizedHtml]);

  // If HTML format: split into top-level blocks and render with optional in-body ad insertion
  if (isHtml) {
    const blocks = splitHtmlBlocks(sanitizedHtml);

    if (blocks.length <= 1 || !adComponent) {
      return (
        <div 
          className={`article-rich-body font-serif-kr text-slate-900 ${fontSizeClass} ${className}`}
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      );
    }

    // Target inserting in-body ad after paragraph 2 or 3 (index 2)
    const adInsertIndex = blocks.length > 3 ? 2 : Math.floor(blocks.length / 2);

    return (
      <div className={`article-rich-body font-serif-kr text-slate-900 ${fontSizeClass} ${className}`}>
        {blocks.map((blockHtml, index) => {
          const showAd = index === adInsertIndex;
          return (
            <React.Fragment key={index}>
              <div dangerouslySetInnerHTML={{ __html: blockHtml }} />
              {showAd && adComponent && (
                <div className="my-6 not-prose">
                  {adComponent}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  // Plain-Text fallback for manual articles (split by double newlines)
  const paragraphs = content
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  if (paragraphs.length === 0) {
    return null;
  }

  const adInsertIndex = paragraphs.length > 3 ? 2 : Math.floor(paragraphs.length / 2);

  return (
    <div className={`font-serif-kr text-slate-900 space-y-6 ${fontSizeClass} ${className}`}>
      {paragraphs.map((paragraph, index) => {
        const showAd = index === adInsertIndex;
        return (
          <React.Fragment key={index}>
            <p className="tracking-normal whitespace-pre-line text-justify leading-loose">
              {paragraph}
            </p>
            {showAd && adComponent && (
              <div className="my-6 not-prose">
                {adComponent}
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
