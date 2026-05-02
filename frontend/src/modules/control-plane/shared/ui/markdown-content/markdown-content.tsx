import { Flex, Link, Text, TextArea } from '@gravity-ui/uikit';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownContentProps {
  content: string;
  emptyText?: string;
}

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  rows?: number;
}

const MarkdownRoot = ({ content, emptyText = 'Контент пока не заполнен.' }: MarkdownContentProps) => {
  const normalizedContent = content.trim();

  if (!normalizedContent) {
    return (
      <Text variant="body-2" color="secondary">
        {emptyText}
      </Text>
    );
  }

  return (
    <div className="sf-markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node: _node, href, children, ...props }) => (
            <Link {...props} href={href ?? '#'} target="_blank" view="primary" rel="noopener noreferrer">
              {children}
            </Link>
          ),
        }}
      >
        {normalizedContent}
      </ReactMarkdown>
    </div>
  );
};

export const MarkdownContent = ({ content, emptyText }: MarkdownContentProps) => {
  return (
    <div
      style={{
        whiteSpace: 'normal',
        lineHeight: 1.6,
      }}
    >
      <MarkdownRoot content={content} emptyText={emptyText} />
    </div>
  );
};

export const MarkdownEditor = ({ value, onChange, disabled = false, rows = 12 }: MarkdownEditorProps) => {
  return (
    <Flex direction="column" gap={2}>
      <Text variant="body-2" color="secondary">
        Поддерживается Markdown. Например: заголовки (`#`), списки (`-`), ссылки (`[текст](url)`).
      </Text>
      <TextArea value={value} rows={rows} onUpdate={onChange} disabled={disabled} />
      <Flex
        direction="column"
        gap={1}
        style={{
          border: '1px solid var(--g-color-line-generic)',
          borderRadius: 8,
          padding: 12,
          background: 'var(--g-color-base-simple-hover)',
          maxHeight: 280,
          overflow: 'auto',
        }}
      >
        <Text variant="subheader-1">Предпросмотр</Text>
        <MarkdownContent content={value} emptyText="Предпросмотр пуст." />
      </Flex>
    </Flex>
  );
};
