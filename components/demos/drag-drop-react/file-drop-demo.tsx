'use client';
import { useState } from 'react';

type FileInfo = { name: string; size: number; type: string };

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileDropDemo() {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [over, setOver] = useState(false);

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setOver(true);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setOver(false);
    const incoming = Array.from(e.dataTransfer.files).map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type || 'unknown',
    }));
    setFiles(incoming);
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={onDragOver}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
        className={`rounded border-2 border-dashed p-8 text-center transition ${over ? 'border-[color:var(--color-accent)] bg-[color:var(--color-bg-soft)]' : 'border-[color:var(--color-border)]'}`}
      >
        <p className="font-serif italic text-[color:var(--color-text-soft)]">
          {over ? 'release to inspect…' : 'Drop a file from your desktop'}
        </p>
        <p className="text-[0.72rem] uppercase tracking-wider text-[color:var(--color-text-faint)] mt-2">
          (nothing leaves your browser)
        </p>
      </div>

      {files.length > 0 && (
        <div className="rounded border border-[color:var(--color-border)] bg-white">
          <p className="text-xs uppercase tracking-wider text-[color:var(--color-text-faint)] px-3 py-2 border-b border-[color:var(--color-border)]">
            e.dataTransfer.files
          </p>
          <ul>
            {files.map((f, i) => (
              <li key={i} className="px-3 py-2.5 border-b border-[color:var(--color-border)] last:border-b-0 grid grid-cols-[1fr_auto_auto] gap-3 items-baseline">
                <span className="font-serif truncate">{f.name}</span>
                <span className="font-mono text-[0.72rem] text-[color:var(--color-text-soft)]">{f.type}</span>
                <span className="font-mono text-[0.72rem] text-[color:var(--color-text-faint)] tabular-nums">{formatSize(f.size)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
