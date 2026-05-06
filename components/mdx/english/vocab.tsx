type VocabItem = {
  en: string;
  ipa?: string;
  vi: string;
  example?: string;
};

export function Vocab({ items }: { items: VocabItem[] }) {
  return (
    <dl className="en-vocab">
      {items.map((item) => (
        <div key={item.en} className="en-vocab-row">
          <dt className="en-vocab-term">
            <span className="en-vocab-en">{item.en}</span>
            {item.ipa && <span className="en-vocab-ipa">/{item.ipa}/</span>}
          </dt>
          <dd className="en-vocab-def">
            <span className="en-vocab-vi">{item.vi}</span>
            {item.example && <span className="en-vocab-example">{item.example}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}
