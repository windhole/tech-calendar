import type { ReactNode } from 'react';

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let key = 0;
  let match = pattern.exec(text);

  while (match) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith('**')) {
      nodes.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    } else {
      const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (link) {
        nodes.push(
          <a key={key++} href={link[2]} target="_blank" rel="noopener noreferrer">
            {link[1]}
          </a>
        );
      }
    }

    lastIndex = match.index + token.length;
    match = pattern.exec(text);
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

interface MarkdownDocProps {
  source: string;
  className?: string;
}

export function MarkdownDoc({ source, className }: MarkdownDocProps) {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const elements: ReactNode[] = [];
  let listItems: string[] = [];
  let key = 0;

  const flushList = () => {
    if (listItems.length === 0) {
      return;
    }

    elements.push(
      <ul key={key++}>
        {listItems.map((item, index) => (
          <li key={index}>{renderInline(item)}</li>
        ))}
      </ul>
    );
    listItems = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (line.startsWith('- ')) {
      listItems.push(line.slice(2));
      continue;
    }

    flushList();

    if (line.trim() === '') {
      continue;
    }

    if (line.startsWith('### ')) {
      elements.push(<h3 key={key++}>{renderInline(line.slice(4))}</h3>);
      continue;
    }

    if (line.startsWith('## ')) {
      elements.push(<h2 key={key++}>{renderInline(line.slice(3))}</h2>);
      continue;
    }

    if (line.startsWith('# ')) {
      elements.push(<h1 key={key++}>{renderInline(line.slice(2))}</h1>);
      continue;
    }

    elements.push(<p key={key++}>{renderInline(line)}</p>);
  }

  flushList();

  return <div className={className}>{elements}</div>;
}
