import { Link } from 'react-router-dom'

const steps = [
  ['User Behavior', 'A search, a view, a moment of curiosity.'],
  ['Event Tracking', 'Turn interactions into useful signals.'],
  ['Interest Profile', 'Understand what catches your eye.'],
  ['Recommendation Engine', 'Connect interests with relevant products.'],
  ['Personalized Content', 'Bring discovery into the social feed.'],
]

export default function Home() {
  return (
    <>
      <section className="hero-section">
        <div className="hero-copy">
          <span className="pill">A smarter way to discover</span>
          <p className="eyebrow hero-label">WELCOME TO SMARTREC</p>
          <h1>Recommendations that learn from <span>behavior.</span></h1>
          <p className="hero-description">Every interaction tells a story. Explore a connected shopping and social experience built to show how everyday behavior can shape personalized discovery.</p>
          <div className="button-row"><Link className="button primary" to="/shop">Explore Shop <span aria-hidden="true">↗</span></Link><Link className="button secondary" to="/social">View Social Feed <span aria-hidden="true">→</span></Link></div>
          <p className="hero-note"><span className="small-dot" />Explore the foundation. Personalization comes next.</p>
        </div>
        <div className="concept-panel" aria-label="Illustration of the planned personalization flow">
          <div className="concept-top"><span className="eyebrow">THE DISCOVERY LOOP</span><span className="sample-label">Concept preview</span></div>
          <div className="signal-card"><span className="concept-icon" aria-hidden="true">⌕</span><div><span className="muted">It starts with a little curiosity</span><strong>“black running shoes”</strong></div><span className="signal-tag">Search</span></div>
          <div className="connector" aria-hidden="true">↓</div>
          <div className="interest-preview"><div className="preview-title"><span className="concept-icon" aria-hidden="true">✧</span><strong>Your interests, taking shape</strong></div><div className="interest-tags"><span>Running</span><span>Footwear</span><span>Active lifestyle</span></div></div>
          <div className="connector" aria-hidden="true">↓</div>
          <div className="discovery-result"><span className="result-symbol" aria-hidden="true">✦</span><div><strong>A more relevant discovery</strong><p>The right content, informed by you.</p></div></div>
          <p className="concept-caption">An illustration of what we’re building. No activity is tracked yet.</p>
        </div>
      </section>
      <section className="workflow-section" aria-labelledby="workflow-title">
        <div className="section-heading"><div><p className="eyebrow">FROM INTERACTION TO INSIGHT</p><h2 id="workflow-title">Small signals. Meaningful connections.</h2></div><span className="sample-label">Planned workflow</span></div>
        <ol className="workflow">{steps.map(([title, description], index) => <li key={title}><div className="step-top"><span className="step-number">0{index + 1}</span>{index < steps.length - 1 && <span className="step-arrow" aria-hidden="true">→</span>}</div><h3>{title}</h3><p>{description}</p></li>)}</ol>
      </section>
      <section className="workspace-banner"><div><span className="eyebrow">YOUR EXPLORATION STARTS HERE</span><h2>One workspace. Three perspectives.</h2><p>Browse the shop, explore the feed, and preview the insights.</p></div><Link className="text-link" to="/analytics">Explore Analytics <span aria-hidden="true">→</span></Link></section>
    </>
  )
}

