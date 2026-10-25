export function BrandWord({ text, showAsterisk = false }: { text: string; showAsterisk?: boolean }) {
  return <span className="pull-word">{text}{showAsterisk ? <span className="word-asterisk" aria-hidden="true">&#10035;</span> : null}</span>;
}
export function StyledHeading({ segments }: { segments: { text: string; className: string }[] }) {
  return <>{segments.map((segment, index) => <span key={index} className={segment.className}>{index > 0 ? ' ' : ''}{segment.text}</span>)}</>;
}
export function BodyCopy({ text }: { text: string }) {
  return <p className="about-body">{text}</p>;
}
