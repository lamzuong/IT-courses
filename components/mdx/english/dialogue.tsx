type DialogueLine = {
  speaker: string;
  en: string;
  vi: string;
};

export function Dialogue({ lines }: { lines: DialogueLine[] }) {
  return (
    <div className="en-dialogue" role="group" aria-label="Sample dialogue">
      {lines.map((line, i) => (
        <div key={i} className="en-dialogue-line">
          <span className="en-dialogue-speaker">{line.speaker}:</span>
          <p className="en-dialogue-en">{line.en}</p>
          <p className="en-dialogue-vi">{line.vi}</p>
        </div>
      ))}
    </div>
  );
}
