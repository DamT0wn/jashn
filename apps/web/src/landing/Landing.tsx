import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Check, CircleDollarSign, ListChecks, Menu, Sparkles, X } from 'lucide-react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { WordsPullUp, WordsPullUpMultiStyle, ScrollText } from './Animation';
import { AmbientVideo } from './AmbientVideo';
import { media } from './media';

const features = [
  { title: 'A budget that adds up.', items: ['Track estimates and confirmed costs.', 'Keep your priorities protected.', 'See your remaining budget clearly.', 'Review changes before applying them.'], link: 'Explore a sample budget', tab: 'budget', icon: CircleDollarSign },
  { title: 'Every detail, in order.', items: ['Turn your date into a practical timeline.', 'Keep tasks and vendor questions together.', 'See what needs attention next.'], link: 'Explore a sample timeline', tab: 'timeline', icon: ListChecks },
  { title: 'Ideas that feel like you.', items: ['Explore themes for your occasion.', 'Match ideas to your preferences.', 'Adapt your plan when things change.'], link: 'Explore sample ideas', tab: 'ideas', icon: Sparkles },
];

function FeatureCard({ feature, index }: { feature: typeof features[number]; index: number }) {
  const [imageFailed, setImageFailed] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const visible = useInView(ref, { once: true, margin: '-100px' });
  const reduced = useReducedMotion();
  const Icon = feature.icon;
  return <motion.article ref={ref} className="feature-card" initial={false} animate={{ scale: reduced || visible ? 1 : .95, opacity: reduced || visible ? 1 : .6 }} transition={{ delay: reduced ? 0 : index * .15, duration: .6, ease: [.22, 1, .36, 1] }}>
    <div className="feature-top"><span className="feature-icon">{imageFailed ? <Icon size={26} aria-hidden="true" /> : <img src={media.icons[index]} alt="" loading="lazy" onError={() => setImageFailed(true)} />}</span><span>0{index + 1}</span></div>
    <h3>{feature.title}</h3><ul>{feature.items.map(item => <li key={item}><Check size={15} aria-hidden="true" /><span>{item}</span></li>)}</ul>
    <Link to={`/demo?tab=${feature.tab}`} className="feature-link">{feature.link}<ArrowUpRight size={19} aria-hidden="true" /></Link>
  </motion.article>;
}

export function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const reduced = useReducedMotion();
  return <div className="landing">
    <a href="#main" className="skip-link">Skip to content</a>
    <main id="main">
      <section className="hero" aria-label="Jashn — Plan the joy">
        <div className="hero-inner">
          <AmbientVideo src={media.hero} label="hero" eager />
          <header className="hero-nav" onKeyDown={event => { if (event.key === 'Escape') { setMenuOpen(false); document.getElementById('menu-toggle')?.focus(); } }}>
            <button id="menu-toggle" className="menu-toggle" aria-expanded={menuOpen} aria-controls="landing-links" onClick={() => setMenuOpen(!menuOpen)}>Jashn <span>{menuOpen ? <X size={18} /> : <Menu size={18} />}<span className="sr-only">Menu</span></span></button>
            <nav id="landing-links" aria-label="Main" className={menuOpen ? 'nav-links is-open' : 'nav-links'} onClick={() => setMenuOpen(false)}>
              <a href="#story">Our story</a><a href="#how-it-works">How it works</a><a href="#features">Features</a><Link to="/demo">Sample plan</Link><Link to="/app/new">Start planning <ArrowUpRight size={12} aria-hidden="true" /></Link>
            </nav>
          </header>
          <div className="hero-kicker"><span className="tiny-star">✳</span><span>Good company.<br />Great celebrations.</span></div>
          <div className="hero-content">
            <div className="hero-brand"><p className="eyebrow">A little less planning. A lot more joy.</p><h1 style={{ color: '#E1E0CC' }}><WordsPullUp text="Jashn" showAsterisk /></h1><p className="hero-tagline">Plan the joy.</p></div>
            <motion.div className="hero-description" initial={reduced ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65, delay: reduced ? 0 : .5, ease: [.16, 1, .3, 1] }}>
              <p>From birthdays to weddings and community gatherings, Jashn turns your ideas into a clear budget, thoughtful timeline and celebration that feels like you.</p>
              <Link to="/app/new" className="primary-cta">Plan your celebration<span><ArrowRight size={19} aria-hidden="true" /></span></Link>
              <Link to="/demo" className="sample-link">Explore a sample plan <ArrowUpRight size={14} aria-hidden="true" /></Link>
            </motion.div>
          </div>
          <div className="hero-footnote"><span>Weddings / Birthdays / Togetherness</span><a href="#story">Scroll to discover ↓</a></div>
        </div>
      </section>
      <section id="story" className="about-section">
        <div className="about-card"><p className="eyebrow">Made for meaningful moments</p><span className="about-star" aria-hidden="true">✳</span>
          <h2><WordsPullUpMultiStyle segments={[{ text: 'You bring the occasion.', className: '' }, { text: 'We help shape the celebration.', className: 'font-serif italic' }, { text: 'Your budget. Your people. Your kind of joy.', className: '' }]} /></h2>
          <ScrollText text="Describe what you are celebrating, who is coming and what you want to spend. Jashn brings your budget, tasks, vendor checklist and ideas together. When plans change, review your options and choose what works for you." />
          <div id="how-it-works" className="steps"><div><span>01 / Tell us</span><p>Your occasion, your people,<br />your priorities.</p></div><div><span>02 / Shape it</span><p>Review a plan.<br />Make it your own.</p></div><div><span>03 / Celebrate</span><p>When life changes,<br />adapt with confidence.</p></div></div>
        </div>
      </section>
      <section id="features" className="features-section"><div className="bg-noise" aria-hidden="true" />
        <div className="features-heading"><p className="eyebrow">The details, beautifully considered</p><h2><WordsPullUpMultiStyle segments={[{ text: 'Thoughtful plans for unforgettable celebrations.', className: '' }, { text: 'Built around your people. Guided by your priorities.', className: 'muted-heading' }]} /></h2></div>
        <div className="feature-grid"><article className="feature-film"><AmbientVideo src={media.feature} label="feature" /><div className="film-caption"><span className="eyebrow">Make room for the moment</span><h3>Your next<br /><em className="font-serif">unforgettable</em><br />moment.</h3><span aria-hidden="true">✳</span></div></article>{features.map((feature, index) => <FeatureCard key={feature.tab} feature={feature} index={index} />)}</div>
        <div className="features-note"><p>You stay in charge. Every change is yours to approve.</p><Link to="/app/new">Let’s make something memorable <ArrowUpRight size={16} aria-hidden="true" /></Link></div>
      </section>
    </main>
    <footer className="landing-footer"><Link to="/" className="footer-brand">Jashn<span>✳</span></Link><span>Plan the joy.</span><p>In development. Planning tools and synthetic samples are coming soon.</p><a href="#main">Back to top ↑</a></footer>
  </div>;
}
