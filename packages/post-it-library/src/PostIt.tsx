import { useCallback, useEffect, useRef, useState } from 'react';
import type { PostItNote } from './types';

const MIN_W = 160;
const MIN_H_EXPANDED = 120;
const FOLDED_H = 44;

type Props = {
  note: PostItNote;
  onChange: (patch: Partial<PostItNote>) => void;
  onFocusNote: () => void;
};

export function PostIt({ note, onChange, onFocusNote }: Props) {
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
        if (note.folded) {
          onChange({ width: w, height: FOLDED_H });
        } else {
          const h = Math.max(MIN_H_EXPANDED, d.oh + (e.clientY - d.sy));
          onChange({ width: w, height: h });
        }
      }
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [note.folded, onChange]);

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

  const toggleFold = () => {
    onFocusNote();
    if (note.folded) {
      const h = note.expandedHeight ?? Math.max(note.height, MIN_H_EXPANDED);
      onChange({ folded: false, height: h });
    } else {
      onChange({ folded: true, expandedHeight: note.height, height: FOLDED_H });
    }
  };

  const h = note.folded ? FOLDED_H : note.height;

  return (
    <article
      className="post-it"
      style={{
        left: note.x,
        top: note.y,
        width: note.width,
        height: h,
        zIndex: note.z,
      }}
      onPointerDown={() => onFocusNote()}
    >
      <header
        className="post-it__head"
        onPointerDown={onHeaderPointerDown}
        style={{ cursor: moving ? 'grabbing' : 'grab' }}
      >
        <span className="post-it__head-title">{preview(note.text)}</span>
        <div className="post-it__head-actions">
          <button type="button" className="post-it__icon-btn post-it__fold" onClick={toggleFold} title={note.folded ? '펼치기' : '접기'}>
            {note.folded ? '펼' : '접'}
          </button>
        </div>
      </header>
      {!note.folded && (
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
      )}
      <button
        type="button"
        className="post-it__resize"
        aria-label={note.folded ? '가로 크기 조절' : '크기 조절'}
        onPointerDown={onResizePointerDown}
        style={{ cursor: note.folded ? 'ew-resize' : 'nwse-resize' }}
      />
    </article>
  );
}

function preview(text: string) {
  const t = text.trim().split('\n')[0] || '포스트잇';
  return t.length > 18 ? `${t.slice(0, 18)}…` : t;
}
