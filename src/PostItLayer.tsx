import { useCallback, useEffect, useMemo, useState } from 'react';
import { PostIt } from './PostIt';
import { loadNotes, saveNotes } from './storage';
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

export function PostItLayer() {
  const [notes, setNotes] = useState<PostItNote[]>(() => {
    const raw = loadNotes() ?? [];
    syncZFromNotes(raw);
    return raw;
  });

  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  const foldedCount = useMemo(() => notes.filter((n) => n.folded).length, [notes]);

  const patch = useCallback((id: string, partial: Partial<PostItNote>) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...partial } : n)));
  }, []);

  const bringToFront = useCallback((id: string) => {
    setNotes((prev) => {
      const z = nextZ();
      return prev.map((n) => (n.id === id ? { ...n, z } : n));
    });
  }, []);

  const addNote = () => {
    setNotes((prev) => [...prev, createNote()]);
  };

  const unfoldAll = () => {
    setNotes((prev) =>
      prev.map((n) => {
        if (!n.folded) return n;
        const h = n.expandedHeight ?? Math.max(n.height, 200);
        return { ...n, folded: false, height: h };
      })
    );
  };

  return (
    <>
      <div className="post-it-layer" aria-hidden={notes.length === 0}>
        {notes.map((n) => (
          <PostIt
            key={n.id}
            note={n}
            onChange={(p) => patch(n.id, p)}
            onFocusNote={() => bringToFront(n.id)}
          />
        ))}
      </div>

      <div className="post-it-fab">
        {foldedCount > 0 && (
          <button type="button" className="post-it-fab__secondary" onClick={unfoldAll} title="접힌 메모 모두 펼치기">
            보관 ({foldedCount})
          </button>
        )}
        <button type="button" className="post-it-fab__primary" onClick={addNote} title="새 포스트잇">
          +
        </button>
      </div>
    </>
  );
}
