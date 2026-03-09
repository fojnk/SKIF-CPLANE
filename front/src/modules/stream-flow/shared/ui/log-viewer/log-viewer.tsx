import './styles.css';

import { useUnit } from 'effector-react';
import React, { useEffect, useMemo, useRef } from 'react';

import { $settings } from '@/modules/stream-flow/entities/log-viewer';

import { ansiToHtml } from './ansi-parser';

interface LogViewerProps {
  /** Содержимое лога */
  content: string;
  /** CSS класс */
  className?: string;
}

export const LogViewer: React.FC<LogViewerProps> = ({
  content,
  className = '',
}) => {
  const settings = useUnit($settings);
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLPreElement>(null);
  const lastLineRef = useRef<HTMLDivElement>(null);
  const prevLinesCountRef = useRef(0);
  const isFirstRenderRef = useRef(true);
  const wasAtBottomRef = useRef(true); // Отслеживаем, был ли пользователь внизу

  const { lines, lineNumbers } = useMemo(() => {
    if (!content) return { lines: [], lineNumbers: [] };

    const contentLines = content.split('\n');
    const processedLines: string[] = [];
    const numbers: number[] = [];

    contentLines.forEach((line, index) => {
      // Конвертируем ANSI коды в HTML для каждой строки
      let html = ansiToHtml(line);

      // Дополнительная подсветка для уровней логов (если ANSI кодов нет в этой строке)
      if (!line.includes('\x1b[')) {
        // Timestamps - cyan
        html = html.replace(
          /(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})?)/g, // eslint-disable-line max-len
          '<span class="log-timestamp">$1</span>',
        );

        // ERROR/FATAL - red
        html = html.replace(
          /\b(ERROR|error|Error|FATAL|fatal|Fatal)\b/g,
          '<span class="log-error">$1</span>',
        );

        // WARN/WARNING - yellow
        html = html.replace(
          /\b(WARN|warn|Warn|WARNING|warning|Warning)\b/g,
          '<span class="log-warn">$1</span>',
        );

        // INFO - green
        html = html.replace(
          /\b(INFO|info|Info)\b/g,
          '<span class="log-info">$1</span>',
        );

        // DEBUG/TRACE - gray
        html = html.replace(
          /\b(DEBUG|debug|Debug|TRACE|trace|Trace)\b/g,
          '<span class="log-debug">$1</span>',
        );
      }

      processedLines.push(html);
      numbers.push(index + 1);
    });

    return { lines: processedLines, lineNumbers: numbers };
  }, [content]);

  // Отслеживаем позицию скролла
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const handleScroll = () => {
      const scrollBottom =
        scrollElement.scrollHeight -
        scrollElement.scrollTop -
        scrollElement.clientHeight;

      // Считаем что пользователь внизу если до конца меньше 90px
      wasAtBottomRef.current = scrollBottom < 90;
    };

    scrollElement.addEventListener('scroll', handleScroll);
    return () => scrollElement.removeEventListener('scroll', handleScroll);
  }, []);

  // Автопрокрутка при добавлении новых строк
  useEffect(() => {
    if (!scrollRef.current || !lastLineRef.current) return;

    // Проверяем, добавились ли новые строки
    if (lines.length > prevLinesCountRef.current) {
      const scrollElement = scrollRef.current;

      // Прокручиваем вниз если это первый рендер или пользователь был внизу
      if (isFirstRenderRef.current || wasAtBottomRef.current) {
        requestAnimationFrame(() => {
          if (isFirstRenderRef.current) {
            // Первая загрузка - мгновенный скролл без анимации с запасом 90px
            const targetScroll =
              scrollElement.scrollHeight - scrollElement.clientHeight + 90;
            scrollElement.scrollTop = targetScroll;
            isFirstRenderRef.current = false;
            wasAtBottomRef.current = true;
          } else if (wasAtBottomRef.current) {
            // Последующие обновления - плавный скролл если пользователь был внизу (< 90px от конца)
            const targetScroll =
              scrollElement.scrollHeight - scrollElement.clientHeight;
            scrollElement.scrollTo({
              top: targetScroll,
              behavior: 'smooth',
            });
          }
        });
      }
    }

    prevLinesCountRef.current = lines.length;
  }, [lines]);

  const containerClassName = `log-viewer-container ${className} ${
    settings.alwaysDarkTheme ? 'dark-theme' : ''
  }`.trim();

  return (
    <div className={containerClassName}>
      <div className="log-viewer-scroll" ref={scrollRef}>
        <pre
          className="log-viewer-content"
          ref={contentRef}
          style={{ fontSize: settings.fontSize }}
        >
          {lines.map((line, index) => (
            <div
              key={index}
              className="log-line"
              ref={index === lines.length - 1 ? lastLineRef : null}
            >
              <span className="log-line-number">{lineNumbers[index]}</span>
              <code dangerouslySetInnerHTML={{ __html: line || '&nbsp;' }} />
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
};
