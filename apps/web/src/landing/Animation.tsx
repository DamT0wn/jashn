import { useRef } from 'react';
import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import type { MotionValue } from 'framer-motion';

export function WordsPullUp({ text, showAsterisk = false }: { text: string; showAsterisk?: boolean }) {
  return <WordsPullUpMultiStyle segments={[{ text, className: '' }]} showAsterisk={showAsterisk} />;
}

export function WordsPullUpMultiStyle({ segments, showAsterisk = false }: { segments: { text: string; className: string }[]; showAsterisk?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const visible = useInView(ref, { once: true });
  const reduced = useReducedMotion();
  const words = segments.flatMap(segment => segment.text.split(' ').map(text => ({ text, className: segment.className })));
  return <span ref={ref} className="word-group"><span className="sr-only">{segments.map(segment => segment.text).join(' ')}</span>
    <span aria-hidden="true" className="word-visual">{words.map((word, index) => <motion.span key={index} className={`pull-word ${word.className}`} initial={false} animate={{ y: reduced || visible ? 0 : 20 }} transition={{ duration: .65, delay: reduced ? 0 : index * .08, ease: [.16, 1, .3, 1] }}>{word.text}{showAsterisk && index === words.length - 1 ? <span className="word-asterisk">✳</span> : null}{index < words.length - 1 ? '\u00a0' : ''}</motion.span>)}</span>
  </span>;
}

export function AnimatedLetter({ letter, index, total, progress }: { letter: string; index: number; total: number; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [index / total - .1, index / total + .05], [.2, 1]);
  return <motion.span style={{ opacity }}>{letter}</motion.span>;
}

export function ScrollText({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.8', 'end 0.2'] });
  let index = 0;
  return <p ref={ref} className="about-body"><span className="sr-only">{text}</span>
    <span aria-hidden="true" className="scroll-copy">{text.split(' ').map((word, wordIndex) => <span className="inline-block" key={wordIndex}>{[...word, ' '].map(letter => { const current = index++; return reduced ? <span key={current}>{letter}</span> : <span className="letter-base" key={current}><span>{letter}</span><span className="letter-highlight"><AnimatedLetter letter={letter} index={current} total={text.length} progress={scrollYProgress} /></span></span>; })}</span>)}</span>
  </p>;
}
