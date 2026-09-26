import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Icons } from '../icons';

interface NoteWidgetProps {
  id?: string;
  isTransparent?: boolean;
  setTransparent?: (v: boolean) => void;
}

type NoteTheme = 'yellow' | 'blue' | 'green' | 'pink' | 'purple' | 'white' | 'dark';
type PaperPattern = 'plain' | 'lined' | 'grid';

interface CheckItem {
  id: string;
  text: string;
  completed: boolean;
}

const THEMES: Record<NoteTheme, {
  name: string;
  bgClass: string;
  borderClass: string;
  headerBg: string;
  textClass: string;
  badgeBg: string;
  swatchBg: string;
}> = {
  yellow: {
    name: 'Post-it Gul',
    bgClass: 'bg-amber-50 dark:bg-amber-950/40',
    borderClass: 'border-amber-200 dark:border-amber-800/60',
    headerBg: 'bg-amber-100/70 dark:bg-amber-900/30',
    textClass: 'text-amber-950 dark:text-amber-100',
    badgeBg: 'bg-amber-200/80 text-amber-900 dark:bg-amber-800 dark:text-amber-100',
    swatchBg: 'bg-amber-200',
  },
  blue: {
    name: 'Himmelsblå',
    bgClass: 'bg-sky-50 dark:bg-sky-950/40',
    borderClass: 'border-sky-200 dark:border-sky-800/60',
    headerBg: 'bg-sky-100/70 dark:bg-sky-900/30',
    textClass: 'text-sky-950 dark:text-sky-100',
    badgeBg: 'bg-sky-200/80 text-sky-900 dark:bg-sky-800 dark:text-sky-100',
    swatchBg: 'bg-sky-200',
  },
  green: {
    name: 'Mintgrön',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/40',
    borderClass: 'border-emerald-200 dark:border-emerald-800/60',
    headerBg: 'bg-emerald-100/70 dark:bg-emerald-900/30',
    textClass: 'text-emerald-950 dark:text-emerald-100',
    badgeBg: 'bg-emerald-200/80 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100',
    swatchBg: 'bg-emerald-200',
  },
  pink: {
    name: 'Ljusrosa',
    bgClass: 'bg-rose-50 dark:bg-rose-950/40',
    borderClass: 'border-rose-200 dark:border-rose-800/60',
    headerBg: 'bg-rose-100/70 dark:bg-rose-900/30',
    textClass: 'text-rose-950 dark:text-rose-100',
    badgeBg: 'bg-rose-200/80 text-rose-900 dark:bg-rose-800 dark:text-rose-100',
    swatchBg: 'bg-rose-200',
  },
  purple: {
    name: 'Lavendel',
    bgClass: 'bg-purple-50 dark:bg-purple-950/40',
    borderClass: 'border-purple-200 dark:border-purple-800/60',
    headerBg: 'bg-purple-100/70 dark:bg-purple-900/30',
    textClass: 'text-purple-950 dark:text-purple-100',
    badgeBg: 'bg-purple-200/80 text-purple-900 dark:bg-purple-800 dark:text-purple-100',
    swatchBg: 'bg-purple-200',
  },
  white: {
    name: 'Vit',
    bgClass: 'bg-white dark:bg-slate-900',
    borderClass: 'border-slate-200 dark:border-slate-700',
    headerBg: 'bg-slate-50 dark:bg-slate-800/60',
    textClass: 'text-slate-900 dark:text-slate-100',
    badgeBg: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
    swatchBg: 'bg-slate-100 border border-slate-300',
  },
  dark: {
    name: 'Griffeltavla',
    bgClass: 'bg-slate-900 text-slate-100',
    borderClass: 'border-slate-700',
    headerBg: 'bg-slate-800',
    textClass: 'text-slate-100',
    badgeBg: 'bg-slate-800 text-slate-200 border border-slate-700',
    swatchBg: 'bg-slate-800',
  }
};

const QUICK_TEMPLATES = [
  { label: 'Uppgift', icon: '📌', placeholder: 'Uppgift: Beskriv uppgiften här...' },
  { label: 'Mål', icon: '🎯', placeholder: 'Dagens mål: Vad ska eleverna förstå och kunna...' },
  { label: 'Instruktion', icon: '📋', placeholder: 'Instruktioner:\n1. Arbeta i par\n2. Diskutera lösningen...' },
  { label: 'Tips', icon: '💡', placeholder: 'Tips: Tänk på samband mellan enheter eller rita en figur...' },
  { label: 'Kom ihåg', icon: '⚠️', placeholder: 'Kom ihåg: Glöm inte att skriva ut enhet i svaret!' },
];

const TEXT_COLORS = [
  { label: 'Standard', color: 'inherit' },
  { label: 'Blå', color: '#2563eb' },
  { label: 'Grön', color: '#16a34a' },
  { label: 'Röd', color: '#dc2626' },
  { label: 'Lila', color: '#9333ea' },
  { label: 'Mörkgrå', color: '#334155' },
];

const HIGHLIGHT_COLORS = [
  { label: 'Ingen', color: 'transparent' },
  { label: 'Gul markör', color: '#fef08a' },
  { label: 'Grön markör', color: '#bbf7d0' },
  { label: 'Rosa markör', color: '#fbcfe8' },
  { label: 'Blå markör', color: '#bae6fd' },
];

export const NoteWidget: React.FC<NoteWidgetProps> = ({ id = 'default' }) => {
  const storageKey = `matteytan_note_${id}`;
  
  // State
  const [title, setTitle] = useState(() => {
    try {
      const saved = localStorage.getItem(`${storageKey}_title`);
      return saved !== null ? saved : 'Uppgiftsbeskrivning';
    } catch {
      return 'Uppgiftsbeskrivning';
    }
  });

  const [theme, setTheme] = useState<NoteTheme>(() => {
    try {
      const saved = localStorage.getItem(`${storageKey}_theme`) as NoteTheme;
      return saved && THEMES[saved] ? saved : 'yellow';
    } catch {
      return 'yellow';
    }
  });

  const [pattern, setPattern] = useState<PaperPattern>(() => {
    try {
      const saved = localStorage.getItem(`${storageKey}_pattern`) as PaperPattern;
      return saved || 'plain';
    } catch {
      return 'plain';
    }
  });

  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>(() => {
    try {
      const saved = localStorage.getItem(`${storageKey}_fontsize`) as any;
      return saved || 'base';
    } catch {
      return 'base';
    }
  });

  const [showChecklist, setShowChecklist] = useState<boolean>(() => {
    try {
      return localStorage.getItem(`${storageKey}_show_checklist`) === 'true';
    } catch {
      return false;
    }
  });

  const [checkItems, setCheckItems] = useState<CheckItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${storageKey}_checklist`);
      return saved ? JSON.parse(saved) : [
        { id: '1', text: 'Förstå frågan och rita en figur', completed: false },
        { id: '2', text: 'Välj metod och ställ upp beräkningen', completed: false },
        { id: '3', text: 'Rimlighetsbedöm svaret och ange enhet', completed: false }
      ];
    } catch {
      return [
        { id: '1', text: 'Förstå frågan och rita en figur', completed: false },
        { id: '2', text: 'Välj metod och ställ upp beräkningen', completed: false },
        { id: '3', text: 'Rimlighetsbedöm svaret och ange enhet', completed: false }
      ];
    }
  });

  const [newCheckItemText, setNewCheckItemText] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strike: false,
  });

  const editorRef = useRef<HTMLDivElement>(null);
  const isFirstLoad = useRef(true);

  // Load editor content from localStorage on mount
  useEffect(() => {
    if (editorRef.current && isFirstLoad.current) {
      isFirstLoad.current = false;
      try {
        const saved = localStorage.getItem(`${storageKey}_html`);
        if (saved) {
          editorRef.current.innerHTML = saved;
        } else {
          editorRef.current.innerHTML = '<p>Skriv uppgiftens instruktioner eller anteckningar här...</p>';
        }
      } catch {
        editorRef.current.innerHTML = '<p>Skriv uppgiftens instruktioner eller anteckningar här...</p>';
      }
    }
  }, [storageKey]);

  // Persist state
  const handleContentInput = useCallback(() => {
    if (editorRef.current) {
      try {
        localStorage.setItem(`${storageKey}_html`, editorRef.current.innerHTML);
      } catch (err) {
        console.error('Failed to save note html', err);
      }
    }
    updateActiveFormats();
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(`${storageKey}_title`, title);
    } catch {}
  }, [title, storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(`${storageKey}_theme`, theme);
    } catch {}
  }, [theme, storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(`${storageKey}_pattern`, pattern);
    } catch {}
  }, [pattern, storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(`${storageKey}_fontsize`, fontSize);
    } catch {}
  }, [fontSize, storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(`${storageKey}_show_checklist`, String(showChecklist));
      localStorage.setItem(`${storageKey}_checklist`, JSON.stringify(checkItems));
    } catch {}
  }, [showChecklist, checkItems, storageKey]);

  const updateActiveFormats = () => {
    try {
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strike: document.queryCommandState('strikeThrough'),
      });
    } catch {}
  };

  // Rich text formatting execution
  const executeCommand = (cmd: string, val: string | undefined = undefined) => {
    document.execCommand(cmd, false, val);
    if (editorRef.current) {
      editorRef.current.focus();
    }
    handleContentInput();
  };

  const applyTemplate = (template: typeof QUICK_TEMPLATES[0]) => {
    setTitle(`${template.icon} ${template.label}`);
    if (editorRef.current) {
      editorRef.current.innerHTML = `<p><strong>${template.label}:</strong></p><p>${template.placeholder.replace(/\n/g, '<br/>')}</p>`;
      handleContentInput();
    }
  };

  // Checklist management
  const toggleCheckItem = (itemId: string) => {
    setCheckItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    ));
  };

  const addCheckItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newCheckItemText.trim()) return;
    const newItem: CheckItem = {
      id: String(Date.now()),
      text: newCheckItemText.trim(),
      completed: false,
    };
    setCheckItems(prev => [...prev, newItem]);
    setNewCheckItemText('');
  };

  const removeCheckItem = (itemId: string) => {
    setCheckItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Copy note
  const handleCopy = () => {
    if (!editorRef.current) return;
    const plainText = `${title}\n\n${editorRef.current.innerText}` + 
      (showChecklist && checkItems.length > 0 
        ? `\n\nDelmoment:\n` + checkItems.map(c => `[${c.completed ? 'X' : ' '}] ${c.text}`).join('\n')
        : '');
    
    navigator.clipboard.writeText(plainText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Clear note
  const handleClear = () => {
    if (window.confirm('Vill du rensa anteckningen?')) {
      if (editorRef.current) {
        editorRef.current.innerHTML = '<p></p>';
        handleContentInput();
      }
      setCheckItems([]);
    }
  };

  const currentTheme = THEMES[theme] || THEMES.yellow;

  // Background pattern styling
  const getPatternStyle = () => {
    if (pattern === 'lined') {
      return {
        backgroundImage: 'linear-gradient(rgba(148, 163, 184, 0.25) 1px, transparent 1px)',
        backgroundSize: '100% 28px',
        lineHeight: '28px'
      };
    }
    if (pattern === 'grid') {
      return {
        backgroundImage: 'linear-gradient(to right, rgba(148, 163, 184, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.2) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        lineHeight: '24px'
      };
    }
    return {};
  };

  const fontSizeClass = {
    sm: 'text-xs leading-relaxed',
    base: 'text-sm leading-relaxed',
    lg: 'text-base leading-relaxed',
    xl: 'text-lg leading-relaxed',
  }[fontSize];

  return (
    <div className={`h-full w-full flex flex-col rounded-xl overflow-hidden border ${currentTheme.borderClass} ${currentTheme.bgClass} shadow-sm transition-colors duration-300 relative select-text`}>
      
      {/* Header bar: Title & Theme / Pattern selectors */}
      <div className={`px-3 py-2 border-b ${currentTheme.borderClass} ${currentTheme.headerBg} flex items-center justify-between gap-2 shrink-0 select-none`}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Icons.Note size={18} className="text-amber-600 dark:text-amber-400 shrink-0" />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titel / Rubrik..."
            className="font-bold text-sm bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-500/40 rounded px-1 w-full truncate placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Theme Palette Button */}
          <div className="relative">
            <button
              onClick={() => setShowThemePicker(!showThemePicker)}
              className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
              title="Välj färg och stil"
            >
              <Icons.Palette size={16} />
            </button>

            {showThemePicker && (
              <div className="absolute right-0 top-full mt-1 z-50 p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 w-52 space-y-2 animate-in fade-in zoom-in-95 duration-150">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Post-it färg</div>
                <div className="grid grid-cols-4 gap-1.5">
                  {(Object.keys(THEMES) as NoteTheme[]).map((tKey) => {
                    const th = THEMES[tKey];
                    return (
                      <button
                        key={tKey}
                        onClick={() => { setTheme(tKey); setShowThemePicker(false); }}
                        className={`h-7 rounded-lg ${th.swatchBg} flex items-center justify-center transition-transform hover:scale-105 ${theme === tKey ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                        title={th.name}
                      >
                        {theme === tKey && <Icons.Check size={12} className={tKey === 'dark' ? 'text-white' : 'text-slate-800'} />}
                      </button>
                    );
                  })}
                </div>

                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-700">Mönster</div>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'plain', label: 'Blank' },
                    { id: 'lined', label: 'Linjer' },
                    { id: 'grid', label: 'Rutor' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPattern(p.id as PaperPattern)}
                      className={`px-1.5 py-1 text-[10px] font-bold rounded border transition-all ${
                        pattern === p.id 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-700">Textstorlek</div>
                <div className="grid grid-cols-4 gap-1">
                  {(['sm', 'base', 'lg', 'xl'] as const).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setFontSize(sz)}
                      className={`py-1 text-[10px] font-bold rounded border uppercase transition-all ${
                        fontSize === sz
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Info Button */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`p-1.5 rounded-lg transition-colors ${showInfo ? 'bg-blue-600 text-white' : 'hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300'}`}
            title="Om Antecknings-widgeten"
          >
            <Icons.Info size={16} />
          </button>
        </div>
      </div>

      {/* Quick Template Badges Bar */}
      <div className={`px-2 py-1.5 border-b ${currentTheme.borderClass} flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 select-none bg-black/[0.02] dark:bg-white/[0.02]`}>
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 pl-1 shrink-0">Mallar:</span>
        {QUICK_TEMPLATES.map((tmpl) => (
          <button
            key={tmpl.label}
            onClick={() => applyTemplate(tmpl)}
            className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white/80 dark:bg-slate-800/80 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/40 dark:hover:text-blue-300 border border-slate-200 dark:border-slate-700 transition-all shrink-0 flex items-center gap-1 shadow-2xs"
            title={`Klicka för att sätta ${tmpl.label}-mall`}
          >
            <span>{tmpl.icon}</span>
            <span>{tmpl.label}</span>
          </button>
        ))}
      </div>

      {/* Basic Text Formatting Toolbar */}
      <div className={`px-2 py-1.5 border-b ${currentTheme.borderClass} flex items-center flex-wrap gap-1 shrink-0 bg-white/40 dark:bg-slate-900/40 select-none`}>
        {/* Bold */}
        <button
          onMouseDown={(e) => { e.preventDefault(); executeCommand('bold'); }}
          className={`p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors ${activeFormats.bold ? 'bg-blue-500 text-white shadow-xs' : 'text-slate-700 dark:text-slate-200'}`}
          title="Fetstil (Ctrl+B)"
        >
          <Icons.Bold size={14} />
        </button>

        {/* Italic */}
        <button
          onMouseDown={(e) => { e.preventDefault(); executeCommand('italic'); }}
          className={`p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors ${activeFormats.italic ? 'bg-blue-500 text-white shadow-xs' : 'text-slate-700 dark:text-slate-200'}`}
          title="Kursiv (Ctrl+I)"
        >
          <Icons.Italic size={14} />
        </button>

        {/* Underline */}
        <button
          onMouseDown={(e) => { e.preventDefault(); executeCommand('underline'); }}
          className={`p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors ${activeFormats.underline ? 'bg-blue-500 text-white shadow-xs' : 'text-slate-700 dark:text-slate-200'}`}
          title="Understruken (Ctrl+U)"
        >
          <Icons.Underline size={14} />
        </button>

        {/* Strikethrough */}
        <button
          onMouseDown={(e) => { e.preventDefault(); executeCommand('strikeThrough'); }}
          className={`p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors ${activeFormats.strike ? 'bg-blue-500 text-white shadow-xs' : 'text-slate-700 dark:text-slate-200'}`}
          title="Genomstruken"
        >
          <Icons.Strikethrough size={14} />
        </button>

        <div className="w-[1px] h-4 bg-slate-300 dark:bg-slate-700 mx-0.5" />

        {/* Heading 2 */}
        <button
          onMouseDown={(e) => { e.preventDefault(); executeCommand('formatBlock', '<h2>'); }}
          className="px-1.5 py-0.5 text-xs font-black rounded hover:bg-black/10 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200"
          title="Stor rubrik"
        >
          H1
        </button>

        {/* Heading 3 */}
        <button
          onMouseDown={(e) => { e.preventDefault(); executeCommand('formatBlock', '<h3>'); }}
          className="px-1.5 py-0.5 text-xs font-bold rounded hover:bg-black/10 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200"
          title="Mellanrubrik"
        >
          H2
        </button>

        {/* Normal Paragraph */}
        <button
          onMouseDown={(e) => { e.preventDefault(); executeCommand('formatBlock', '<p>'); }}
          className="px-1.5 py-0.5 text-xs font-medium rounded hover:bg-black/10 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200"
          title="Normal brödtext"
        >
          Text
        </button>

        <div className="w-[1px] h-4 bg-slate-300 dark:bg-slate-700 mx-0.5" />

        {/* Bullet List */}
        <button
          onMouseDown={(e) => { e.preventDefault(); executeCommand('insertUnorderedList'); }}
          className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition-colors"
          title="Punktlista"
        >
          <Icons.List size={14} />
        </button>

        {/* Numbered List */}
        <button
          onMouseDown={(e) => { e.preventDefault(); executeCommand('insertOrderedList'); }}
          className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition-colors"
          title="Numrerad lista"
        >
          <Icons.ListOrdered size={14} />
        </button>

        {/* Checklist toggle */}
        <button
          onClick={() => setShowChecklist(!showChecklist)}
          className={`p-1.5 rounded transition-colors ${showChecklist ? 'bg-indigo-600 text-white' : 'hover:bg-black/10 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200'}`}
          title={showChecklist ? "Dölj checklista" : "Visa interaktiv checklista / delmoment"}
        >
          <Icons.CheckSquare size={14} />
        </button>

        <div className="w-[1px] h-4 bg-slate-300 dark:bg-slate-700 mx-0.5" />

        {/* Align Left & Center */}
        <button
          onMouseDown={(e) => { e.preventDefault(); executeCommand('justifyLeft'); }}
          className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition-colors"
          title="Vänsterställ"
        >
          <Icons.AlignLeft size={14} />
        </button>
        <button
          onMouseDown={(e) => { e.preventDefault(); executeCommand('justifyCenter'); }}
          className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition-colors"
          title="Centrera"
        >
          <Icons.AlignCenter size={14} />
        </button>

        <div className="w-[1px] h-4 bg-slate-300 dark:bg-slate-700 mx-0.5" />

        {/* Text Colors */}
        <div className="flex items-center gap-1">
          {TEXT_COLORS.map(c => (
            <button
              key={c.label}
              onMouseDown={(e) => { e.preventDefault(); executeCommand('foreColor', c.color); }}
              className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 hover:scale-110 transition-transform"
              style={{ backgroundColor: c.color === 'inherit' ? '#000000' : c.color }}
              title={`Textfärg: ${c.label}`}
            />
          ))}
        </div>

        {/* Highlight Markers */}
        <div className="flex items-center gap-1 pl-1">
          <Icons.Highlighter size={13} className="text-slate-400" />
          {HIGHLIGHT_COLORS.map(h => (
            <button
              key={h.label}
              onMouseDown={(e) => { e.preventDefault(); executeCommand('hiliteColor', h.color); }}
              className={`w-3.5 h-3.5 rounded border border-slate-300 dark:border-slate-600 hover:scale-110 transition-transform ${h.color === 'transparent' ? 'relative overflow-hidden' : ''}`}
              style={{ backgroundColor: h.color }}
              title={`Överstrykningsfärg: ${h.label}`}
            >
              {h.color === 'transparent' && (
                <div className="w-full h-full relative">
                  <div className="w-[1px] h-4 bg-red-400 rotate-45 absolute left-1 -top-0.5" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area: Rich Text Editor */}
      <div 
        className="flex-1 p-3 overflow-y-auto min-h-[140px] focus:outline-none transition-all"
        style={getPatternStyle()}
      >
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleContentInput}
          onKeyUp={updateActiveFormats}
          onMouseUp={updateActiveFormats}
          className={`min-h-full outline-none ${currentTheme.textClass} ${fontSizeClass} prose dark:prose-invert max-w-none focus:outline-none [&>h2]:text-lg [&>h2]:font-bold [&>h2]:mt-2 [&>h2]:mb-1 [&>h3]:text-base [&>h3]:font-semibold [&>h3]:mt-1.5 [&>h3]:mb-1 [&>p]:mb-1.5 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5`}
        />
      </div>

      {/* Optional Interactive Checklist Section */}
      {showChecklist && (
        <div className={`p-2.5 border-t ${currentTheme.borderClass} bg-white/60 dark:bg-slate-900/60 shrink-0 max-h-48 overflow-y-auto`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Icons.CheckSquare size={13} />
              Delmoment & Checklista
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              {checkItems.filter(c => c.completed).length} av {checkItems.length} klara
            </span>
          </div>

          <div className="space-y-1.5">
            {checkItems.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center gap-2 group p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => toggleCheckItem(item.id)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600 shrink-0"
                />
                <span className={`text-xs flex-1 transition-all ${item.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>
                  {item.text}
                </span>
                <button
                  onClick={() => removeCheckItem(item.id)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-red-500 rounded transition-all shrink-0"
                  title="Ta bort delmoment"
                >
                  <Icons.X size={13} />
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={addCheckItem} className="mt-2 flex gap-1.5">
            <input
              type="text"
              value={newCheckItemText}
              onChange={(e) => setNewCheckItemText(e.target.value)}
              placeholder="Lägg till delmoment / steg..."
              className="flex-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!newCheckItemText.trim()}
              className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-40 transition-colors flex items-center gap-1"
            >
              <Icons.Plus size={13} />
              <span>Lägg till</span>
            </button>
          </form>
        </div>
      )}

      {/* Footer bar: Stats, Copy & Clear */}
      <div className={`px-3 py-1.5 border-t ${currentTheme.borderClass} ${currentTheme.headerBg} flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 shrink-0 select-none`}>
        <div className="flex items-center gap-2">
          <span>{currentTheme.name}</span>
          <span>•</span>
          <span>{pattern === 'plain' ? 'Blankt' : pattern === 'lined' ? 'Linjerat' : 'Rutat'}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 font-semibold transition-colors"
            title="Kopiera text"
          >
            <Icons.Copy size={12} />
            <span>{copied ? 'Kopierat!' : 'Kopiera'}</span>
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 text-slate-500 transition-colors"
            title="Rensa text"
          >
            <Icons.Trash size={12} />
            <span>Rensa</span>
          </button>
        </div>
      </div>

      {/* Info Modal */}
      {showInfo && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Icons.Note size={20} />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Om Antecknings-widgeten</h3>
              </div>
              <button 
                onClick={() => setShowInfo(false)} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <Icons.Close size={16} />
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
              <p>
                Använd Antecknings-widgeten för att skriva <strong>korta noteringar</strong>, <strong>uppgiftsbeskrivningar</strong>, matematiska frågeställningar eller mål direkt på whiteboarden.
              </p>
              <ul className="list-disc pl-4 space-y-1 text-[11px]">
                <li><strong>Textformatering:</strong> Fetstil, kursiv, understruken, rubriknivåer och listor.</li>
                <li><strong>Färgmarkering:</strong> Byt textfärg eller stryk över med markörpennor.</li>
                <li><strong>Mallar:</strong> Snabbinfoga färdiga upplägg för Uppgift, Mål, Instruktion och Tips.</li>
                <li><strong>Post-it stilar:</strong> Välj mellan klassiska färger samt linjerat eller rutat papper.</li>
                <li><strong>Checklista:</strong> Slå på delmoment för att bocka av steg under problemlösning.</li>
              </ul>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-end">
              <button
                onClick={() => setShowInfo(false)}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
              >
                Stäng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
