import { Link } from 'react-router-dom'

const posts = [
  { initials: 'MJ', name: 'Maya Jones', topic: 'Everyday style', time: '2 hours ago', text: 'A good outfit doesn’t need to be complicated. A relaxed shirt, your favorite denim, and shoes you can walk in all day. What’s your everyday go-to?', theme: 'style', headline: 'Less effort. More you.', caption: 'THE EVERYDAY EDIT', likes: 24, comments: 6 },
  { initials: 'AL', name: 'Alex Lee', topic: 'Life in motion', time: '4 hours ago', text: 'Swapped screen time for a morning run. Sometimes the best upgrade to your routine is just getting outside.', theme: 'outdoors', headline: 'Make room for a little outside.', caption: 'A FRESH PERSPECTIVE', likes: 38, comments: 4 },
]

export default function SocialFeed() {
  return (
    <section className="page-section">
      <div className="page-heading"><div><p className="eyebrow">THE SOCIAL SIDE</p><h1>A feed for discovery.</h1><p>Everyday inspiration, with room for something more personal.</p></div><span className="sample-label">Preview · Sample posts</span></div>
      <div className="social-layout"><div className="feed-stack">{posts.map(post => <article className="post-card" key={post.name}><header className="post-header"><span className={`avatar ${post.theme}`}>{post.initials}</span><div><h2>{post.name}</h2><p>{post.topic} <span aria-hidden="true">·</span> {post.time}</p></div><span className="post-demo">Sample</span></header><p className="post-copy">{post.text}</p><div className={`post-art ${post.theme}`}><span>{post.caption}</span><h3>{post.headline}</h3><div className="art-circles" aria-hidden="true" /></div><footer className="post-footer"><span>♡ {post.likes} likes</span><span>◯ {post.comments} comments</span><span>Demo post</span></footer></article>)}</div>
        <aside className="social-sidebar"><section className="sponsored-card"><span className="eyebrow">A SPACE FOR RELEVANCE</span><div className="sponsored-symbol" aria-hidden="true">✧</div><h2>Sponsored Recommendation</h2><p>Personalized sponsored products will appear here based on Shop activity.</p><span className="sample-label">Coming soon</span></section><section className="panel"><h2>Discovery, connected.</h2><p>The shop and feed will eventually work together to bring your interests into focus.</p><Link className="text-link" to="/shop">Explore the shop <span aria-hidden="true">→</span></Link></section></aside>
      </div>
    </section>
  )
}

