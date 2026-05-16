'use client';
import { useEffect, useState } from 'react';

type Lang = 'en' | 'vi';
const STORAGE_KEY = 'lesson-lang';
const FLOATING_THRESHOLD = 240; // px scrolled before the floating copy appears

function readStored(): Lang {
  if (typeof window === 'undefined') return 'en';
  return window.localStorage.getItem(STORAGE_KEY) === 'vi' ? 'vi' : 'en';
}

function applyLang(lang: Lang) {
  document.documentElement.setAttribute('data-lang', lang);
}

export function LanguageToggle() {
  const [lang, setLang] = useState<Lang>('en');
  const [floating, setFloating] = useState(false);

  useEffect(() => {
    const initial = readStored();
    setLang(initial);
    applyLang(initial);

    function onScroll() {
      setFloating(window.scrollY > FLOATING_THRESHOLD);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function choose(next: Lang) {
    setLang(next);
    applyLang(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }

  function renderButtons() {
    return (
      <>
        <button
          type="button"
          className={`lang-toggle-btn${lang === 'en' ? ' is-active' : ''}`}
          aria-pressed={lang === 'en'}
          onClick={() => choose('en')}
        >
          EN
        </button>
        <button
          type="button"
          className={`lang-toggle-btn${lang === 'vi' ? ' is-active' : ''}`}
          aria-pressed={lang === 'vi'}
          onClick={() => choose('vi')}
        >
          VI
        </button>
      </>
    );
  }

  return (
    <>
      <div
        className="lang-toggle"
        role="group"
        aria-label="Choose lesson language"
      >
        {renderButtons()}
      </div>
      <div
        className={`lang-toggle lang-toggle--floating${floating ? ' is-visible' : ''}`}
        role="group"
        aria-label="Choose lesson language"
        aria-hidden={!floating}
      >
        {renderButtons()}
      </div>
    </>
  );
}
