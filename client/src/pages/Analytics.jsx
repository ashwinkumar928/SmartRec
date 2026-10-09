const metrics = [['Total Events', '128', 'All sample interactions', '↗'], ['Searches', '42', 'Curiosity in action', '⌕'], ['Product Views', '64', 'Products explored', '◇'], ['Cart Actions', '22', 'Illustrative cart activity', '+']]
const interests = [['Fashion', 70], ['Technology', 40], ['Shoes', 25]]
const activities = [['Search', 'Searched for “black shirt”', '2 min ago'], ['Product view', 'Viewed Running Shoes', '8 min ago'], ['Cart action', 'Added Smart Watch to cart', '15 min ago'], ['Search', 'Searched for “casual”', '24 min ago']]

export default function Analytics() {
  return (
    <section className="page-section">
      <div className="page-heading"><div><p className="eyebrow">BEHIND THE DISCOVERY</p><h1>From behavior to insight.</h1><p>A preview of how interactions will build a picture of user interests.</p></div><span className="sample-label">Sample data only</span></div>
      <div className="notice"><span aria-hidden="true">ⓘ</span><p>This dashboard uses illustrative data. Searches, product views, and cart actions are not being tracked.</p></div>
      <div className="metrics-grid">{metrics.map(([label, value, description, icon]) => <article className="metric-card" key={label}><div className="metric-header"><h2>{label}</h2><span aria-hidden="true">{icon}</span></div><strong>{value}</strong><p>{description}</p></article>)}</div>
      <div className="analytics-grid"><section className="panel"><div className="panel-heading"><h2>User Interest Profile</h2><span className="sample-label">Example</span></div><p>Illustrative interest scores across categories.</p><div className="interest-bars">{interests.map(([name, score]) => <div key={name}><div className="bar-label"><label htmlFor={`interest-${name}`}>{name}</label><strong>{score}%</strong></div><progress id={`interest-${name}`} value={score} max="100">{score}%</progress></div>)}</div><p className="panel-note">Each score is independent; these are not shares of a total.</p></section>
        <section className="panel"><div className="panel-heading"><h2>Recent Activity</h2><span className="sample-label">Sample</span></div><p>A snapshot of what an activity stream could look like.</p><ul className="activity-list">{activities.map(([type, description, time], index) => <li key={description}><span className={`activity-dot tone-${index}`} aria-hidden="true" /><div><span className="eyebrow">{type}</span><p>{description}</p></div><span className="activity-time">{time}</span></li>)}</ul></section></div>
    </section>
  )
}

