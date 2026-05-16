'use client';
import { useEffect, useRef, useState } from 'react';

type Variant = 'mandarin' | 'cantonese';

const LANG: Record<Variant, string> = {
  mandarin: 'zh-CN',
  cantonese: 'zh-HK',
};

const ROMAN_LABEL: Record<Variant, string> = {
  mandarin: 'Pinyin',
  cantonese: 'Jyutping',
};

function pickVoice(lang: string): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  return (
    voices.find((v) => v.lang === lang) ??
    voices.find((v) => v.lang.startsWith(lang.split('-')[0])) ??
    null
  );
}

export function ChineseSentence({
  text,
  romanization,
  vietnamese,
  variant = 'mandarin',
  literal,
}: {
  text: string;
  romanization: string;
  vietnamese: string;
  variant?: Variant;
  literal?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const [supported, setSupported] = useState(true);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setSupported(false);
      return;
    }
    // Trigger voice load on Chrome — voices array may start empty until this fires
    const onVoices = () => {};
    window.speechSynthesis.addEventListener('voiceschanged', onVoices);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', onVoices);
      if (utterRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function speak(rate = 0.85) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = LANG[variant];
    u.rate = rate;
    const voice = pickVoice(LANG[variant]);
    if (voice) u.voice = voice;
    u.onstart = () => setPlaying(true);
    u.onend = () => setPlaying(false);
    u.onerror = () => setPlaying(false);
    utterRef.current = u;
    window.speechSynthesis.speak(u);
  }

  return (
    <div className={`zh-sentence zh-sentence--${variant}`}>
      <div className="zh-sentence-audio">
        <button
          type="button"
          className={`zh-play${playing ? ' is-playing' : ''}`}
          onClick={() => speak(0.85)}
          aria-label={`Nghe câu "${text}" — tốc độ chậm`}
          disabled={!supported}
          title={supported ? 'Nghe (chậm)' : 'Trình duyệt không hỗ trợ phát âm'}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              fill="currentColor"
              d="M3 10v4a1 1 0 0 0 1 1h3l4.3 3.7A1 1 0 0 0 13 18V6a1 1 0 0 0-1.7-.7L7 9H4a1 1 0 0 0-1 1zm13.5 2a4.5 4.5 0 0 0-2.1-3.8v7.6A4.5 4.5 0 0 0 16.5 12zm-2.1-7.4v2.1a6.5 6.5 0 0 1 0 10.6v2.1A8.5 8.5 0 0 0 14.4 4.6z"
            />
          </svg>
        </button>
        <button
          type="button"
          className="zh-play zh-play--fast"
          onClick={() => speak(1.05)}
          aria-label={`Nghe câu "${text}" — tốc độ thường`}
          disabled={!supported}
          title="Nghe (thường)"
        >
          1×
        </button>
      </div>
      <div className="zh-sentence-body">
        <p className="zh-hanzi" lang={LANG[variant]}>
          {text}
        </p>
        <p className="zh-roman">
          <span className="zh-roman-label">{ROMAN_LABEL[variant]}</span>
          <span>{romanization}</span>
        </p>
        <p className="zh-vn">{vietnamese}</p>
        {literal && <p className="zh-literal">Nghĩa đen: {literal}</p>}
      </div>
    </div>
  );
}

export function ChineseDialogue({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="zh-dialogue" aria-label={title}>
      {title && <p className="zh-dialogue-title">{title}</p>}
      <div className="zh-dialogue-body">{children}</div>
    </section>
  );
}

export function ChineseLine({
  speaker,
  ...props
}: React.ComponentProps<typeof ChineseSentence> & { speaker?: string }) {
  return (
    <div className="zh-line">
      {speaker && <span className="zh-line-speaker">{speaker}</span>}
      <ChineseSentence {...props} />
    </div>
  );
}
