import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PostIt } from './PostIt';
import { DEFAULT_STORAGE_KEY, loadNotes, saveNotes } from './storage';
import type { PostItNote } from './types';

let zSeed = 1;

function syncZFromNotes(list: PostItNote[]) {
  const maxZ = list.reduce((m, n) => Math.max(m, typeof n.z === 'number' ? n.z : 0), 0);
  zSeed = Math.max(zSeed, maxZ, 1);
}

function nextZ() {
  zSeed += 1;
  return zSeed;
}

function createNote(): PostItNote {
  const w = 260;
  const h = 200;
  return {
    id: crypto.randomUUID(),
    text: '',
    x: Math.max(24, window.innerWidth / 2 - w / 2 + (Math.random() * 40 - 20)),
    y: Math.max(24, window.innerHeight / 2 - h / 2 + (Math.random() * 40 - 20)),
    width: w,
    height: h,
    folded: false,
    z: nextZ(),
  };
}

function listSnippet(text: string) {
  const line = text.trim().split('\n')[0] || '(빈 메모)';
  return line.length > 48 ? `${line.slice(0, 48)}…` : line;
}

export type PostItLayerProps = {
  /** localStorage 키 (앱마다 다르게 두면 데이터가 분리됩니다) */
  storageKey?: string;
};

export function PostItLayer({ storageKey = DEFAULT_STORAGE_KEY }: PostItLayerProps) {
  const [notes, setNotes] = useState<PostItNote[]>(() => {
    const raw = loadNotes(storageKey) ?? [];
    syncZFromNotes(raw);
    return raw;
  });
  const [trayOpen, setTrayOpen] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raw = loadNotes(storageKey) ?? [];
    syncZFromNotes(raw);
    setNotes(raw);
  }, [storageKey]);

  useEffect(() => {
    saveNotes(notes, storageKey);
  }, [notes, storageKey]);

  const visibleNotes = useMemo(() => notes.filter((n) => !n.folded), [notes]);
  const archivedNotes = useMemo(() => notes.filter((n) => n.folded), [notes]);

  useEffect(() => {
    if (archivedNotes.length === 0) setTrayOpen(false);
  }, [archivedNotes.length]);

  useEffect(() => {
    if (!trayOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTrayOpen(false);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (fabRef.current && !fabRef.current.contains(e.target as Node)) {
        setTrayOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointerDown, true);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointerDown, true);
    };
  }, [trayOpen]);

  const patch = useCallback((id: string, partial: Partial<PostItNote>) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...partial } : n)));
  }, []);

  const bringToFront = useCallback((id: string) => {
    setNotes((prev) => {
      const z = nextZ();
      return prev.map((n) => (n.id === id ? { ...n, z } : n));
    });
  }, []);

  const removeNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const archiveNote = useCallback((id: string) => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id !== id) return n;
        return { ...n, folded: true, expandedHeight: n.height };
      })
    );
  }, []);

  const restoreNote = useCallback((id: string) => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id !== id || !n.folded) return n;
        const h = n.expandedHeight ?? Math.max(n.height, 200);
        return { ...n, folded: false, height: h };
      })
    );
  }, []);

  const restoreAll = useCallback(() => {
    setNotes((prev) =>
      prev.map((n) => {
        if (!n.folded) return n;
        const h = n.expandedHeight ?? Math.max(n.height, 200);
        return { ...n, folded: false, height: h };
      })
    );
    setTrayOpen(false);
  }, []);

  const addNote = () => {
    setNotes((prev) => [...prev, createNote()]);
  };

  return (
    <>
      <div className="post-it-layer" aria-hidden={notes.length === 0}>
        {visibleNotes.map((n) => (
          <PostIt
            key={n.id}
            note={n}
            onChange={(p) => patch(n.id, p)}
            onFocusNote={() => bringToFront(n.id)}
            onDelete={() => removeNote(n.id)}
            onArchive={() => archiveNote(n.id)}
          />
        ))}
      </div>

      <div className="post-it-fab" ref={fabRef}>
        {trayOpen && archivedNotes.length > 0 && (
          <div className="post-it-tray" role="dialog" aria-label="보관한 포스트잇">
            <div className="post-it-tray__head">
              <span className="post-it-tray__count">{archivedNotes.length}개 보관</span>
              <button type="button" className="post-it-tray__link" onClick={restoreAll}>
                모두 꺼내기
              </button>
            </div>
            <ul className="post-it-tray__list">
              {archivedNotes.map((n) => (
                <li key={n.id} className="post-it-tray__item">
                  <span className="post-it-tray__snippet">{listSnippet(n.text)}</span>
                  <span className="post-it-tray__actions">
                    <button type="button" className="post-it-tray__btn" onClick={() => restoreNote(n.id)}>
                      꺼내기
                    </button>
                    <button type="button" className="post-it-tray__btn post-it-tray__btn--danger" onClick={() => removeNote(n.id)}>
                      삭제
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="post-it-fab__row">
          <button type="button" className="post-it-fab__primary" onClick={addNote} title="새 포스트잇" aria-label="새 포스트잇">
            +
          </button>
          {archivedNotes.length > 0 && (
            <button
              type="button"
              className="post-it-fab__tray"
              onClick={() => setTrayOpen((o) => !o)}
              title="보관한 포스트잇"
              aria-label={`보관한 포스트잇 ${archivedNotes.length}개`}
              aria-expanded={trayOpen}
            >
              <IconPostItStack />
              <span className="post-it-fab__badge">{archivedNotes.length}</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}

function IconPostItStack() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden className="post-it-fab__tray-svg">
      <path
        d="M7 5.5h9a1.5 1.5 0 0 1 1.5 1.5v8.5L14 18.5H7A1.5 1.5 0 0 1 5.5 17V7A1.5 1.5 0 0 1 7 5.5Z"
        fill="#fff9c4"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M8.5 4h9A1.5 1.5 0 0 1 19 5.5V14"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M10 3.25h9A1.5 1.5 0 0 1 20.5 4.75v8"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}
