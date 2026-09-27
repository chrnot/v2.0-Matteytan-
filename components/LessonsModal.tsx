import React, { useState, memo } from 'react';
import { SavedLesson } from '../types';
import { Icons } from './icons';

interface LessonsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessons: SavedLesson[];
  onSave: (name: string, existingId?: string) => void;
  onLoad: (lesson: SavedLesson) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
}

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleString('sv-SE', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
};

export const LessonsModal: React.FC<LessonsModalProps> = memo(({
  isOpen,
  onClose,
  lessons,
  onSave,
  onLoad,
  onDelete,
  onRename,
}) => {
  const [newName, setNewName] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  if (!isOpen) return null;

  const handleSaveNew = () => {
    const name = newName.trim();
    if (!name) return;
    try {
      setSaveError(null);
      onSave(name);
      setNewName('');
    } catch (err: any) {
      setSaveError(err?.message?.includes('quota') || err?.name === 'QuotaExceededError'
        ? 'Lagringsutrymmet i webbläsaren är fullt. Radera en gammal lektion och försök igen.'
        : 'Kunde inte spara lektionen just nu.');
    }
  };

  const startRename = (lesson: SavedLesson) => {
    setRenamingId(lesson.id);
    setRenameValue(lesson.name);
  };

  const commitRename = () => {
    const name = renameValue.trim();
    if (renamingId && name) {
      onRename(renamingId, name);
    }
    setRenamingId(null);
    setRenameValue('');
  };

  return (
    <div
      className="fixed inset-0 z-[3000] flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200 select-none export-ignore"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[88vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Icons.FolderOpen size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-800 dark:text-slate-100">
                Lektioner
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Spara whiteboarden och öppna den igen senare.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Stäng"
          >
            <Icons.Close size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-5">
          {/* Save as new lesson */}
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-2">
              Spara nuvarande som ny lektion
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => { setNewName(e.target.value); setSaveError(null); }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveNew(); }}
                placeholder="Ex. Bråk åk 5, lektion 3"
                className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              <button
                type="button"
                onClick={handleSaveNew}
                disabled={!newName.trim()}
                title="Spara som ny lektion"
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                <Icons.Save size={15} />
                Spara
              </button>
            </div>
            {saveError && (
              <p className="text-xs text-rose-500 font-semibold mt-1.5">{saveError}</p>
            )}
          </div>

          {/* Saved lessons list */}
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-2">
              Sparade lektioner ({lessons.length})
            </label>

            {lessons.length === 0 ? (
              <div className="text-xs text-slate-400 dark:text-slate-500 p-4 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                Du har inga sparade lektioner ännu.
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {lessons.map((lesson) => (
                  <li
                    key={lesson.id}
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40"
                  >
                    <div className="flex-1 min-w-0">
                      {renamingId === lesson.id ? (
                        <input
                          autoFocus
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') commitRename();
                            if (e.key === 'Escape') setRenamingId(null);
                          }}
                          onBlur={commitRename}
                          className="w-full px-2 py-1 text-sm rounded-lg border border-blue-300 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none"
                        />
                      ) : (
                        <>
                          <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
                            {lesson.name}
                          </div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500">
                            Sparad {formatDate(lesson.savedAt)} · {lesson.snapshot.widgets.length} widgetar
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => onLoad(lesson)}
                        className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                        title="Öppna lektionen (ersätter nuvarande whiteboard)"
                      >
                        Öppna
                      </button>
                      <button
                        type="button"
                        onClick={() => startRename(lesson)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                        title="Döp om"
                      >
                        <Icons.Pencil size={15} />
                      </button>

                      {confirmDeleteId === lesson.id ? (
                        <button
                          type="button"
                          onClick={() => { onDelete(lesson.id); setConfirmDeleteId(null); }}
                          onBlur={() => setConfirmDeleteId(null)}
                          autoFocus
                          className="px-2 py-1.5 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-colors"
                          title="Klicka igen för att bekräfta radering"
                        >
                          Radera?
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(lesson.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Radera"
                        >
                          <Icons.Trash size={15} />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
          <Icons.Check size={14} className="text-emerald-500 flex-shrink-0" />
          Ditt pågående arbete sparas också automatiskt i den här webbläsaren.
        </div>
      </div>
    </div>
  );
});
