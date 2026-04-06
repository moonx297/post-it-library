import { useCallback, useEffect, useRef, useState } from 'react';
import type { PostItNote } from './types';

const MIN_W = 160;
const MIN_H_EXPANDED = 120;

type Props = {
  note: PostItNote;
  onChange: (patch: Partial<PostItNote>) => void;
  onFocusNote: () => void;
  onDelete: () => void;
  onArchive: () => void;
};

export function PostIt({ note, onChange, onFocusNote, onDelete, onArchive }: Props) {
  const dragRef = useRef<{
    type: 'move' | 'resize';
    sx: number;
    sy: number;
    ox: number;
    oy: number;
    ow: number;
    oh: number;
  } | null>(null);

  const [moving, setMoving] = useState(false);

  const endDrag = useCallback(() => {
    dragRef.current = null;
    setMoving(false);
  }, []);

  useEffect(() => {
    const onUp = () => endDrag();
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [endDrag]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      if (d.type === 'move') {
        onChange({
          x: d.ox + (e.clientX - d.sx),
          y: d.oy + (e.clientY - d.sy),
        });
      } else {
        const w = Math.max(MIN_W, d.ow + (e.clientX - d.sx));
        const h = Math.max(MIN_H_EXPANDED, d.oh + (e.clientY - d.sy));
        onChange({ width: w, height: h });
      }
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [onChange]);

  const onHeaderPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    e.preventDefault();
    onFocusNote();
    dragRef.current = {
      type: 'move',
      sx: e.clientX,
      sy: e.clientY,
      ox: note.x,
      oy: note.y,
      ow: note.width,
      oh: note.height,
    };
    setMoving(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onResizePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFocusNote();
    dragRef.current = {
      type: 'resize',
      sx: e.clientX,
      sy: e.clientY,
      ox: note.x,
      oy: note.y,
      ow: note.width,
      oh: note.height,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  return (
    <article
      className="post-it"
      style={{
        left: note.x,
        top: note.y,
        width: note.width,
        height: note.height,
        zIndex: note.z,
      }}
      onPointerDown={() => onFocusNote()}
    >
      <header
        className="post-it__head"
        onPointerDown={onHeaderPointerDown}
        style={{ cursor: moving ? 'grabbing' : 'grab' }}
      >
        <span className="post-it__head-drag" aria-hidden />
        <div className="post-it__head-actions">
          <button type="button" className="post-it__icon-btn" onClick={onArchive} title="보관으로 보내기" aria-label="보관으로 보내기">
            <IconMinus />
          </button>
          <button type="button" className="post-it__icon-btn" onClick={onDelete} title="삭제" aria-label="삭제">
            <IconTrash />
          </button>
        </div>
      </header>
      <div className="post-it__body">
        <textarea
          className="post-it__textarea"
          value={note.text}
          onChange={(e) => onChange({ text: e.target.value })}
          onPointerDown={(e) => e.stopPropagation()}
          placeholder="메모…"
          spellCheck={false}
        />
      </div>
      <button
        type="button"
        className="post-it__resize"
        aria-label="크기 조절"
        onPointerDown={onResizePointerDown}
      />
    </article>
  );
}

function IconMinus() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
      <line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M3 4h8l-.7 7.1a1 1 0 0 1-1 .9H4.7a1 1 0 0 1-1-.9L3 4Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M5.5 4V2.5h3V4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M2 4h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
