import { Link } from 'react-router-dom'

import { useEffect, useState } from 'react'
import ProductCard from '../components/ProductCard'
import { getRecommendations } from '../services/api'

const posts = [
  { initials: 'MJ', name: 'Maya Jones', topic: 'Everyday style', time: '2 hours ago', text: 'A good outfit doesn’t need to be complicated. A relaxed shirt, your favorite denim, and shoes you can walk in all day. What’s your everyday go-to?', theme: 'style', headline: 'Less effort. More you.', caption: 'THE EVERYDAY EDIT', likes: 24, comments: 6 },
  { initials: 'AL', name: 'Alex Lee', topic: 'Life in motion', time: '4 hours ago', text: 'Swapped screen time for a morning run. Sometimes the best upgrade to your routine is just getting outside.', theme: 'outdoors', headline: 'Make room for a little outside.', caption: 'A FRESH PERSPECTIVE', likes: 38, comments: 4 },
]

export default function SocialFeed() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    getRecommendations(1, { signal: controller.signal })
      .then(result => {
        if (!controller.signal.aborted) setData(result)
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [])

  const sponsoredProduct = data?.recommendations[0]
  const coldStart = data && Object.keys(data.interestScores).length === 0

  return (
    <section className="page-section">
      <div className="page-heading"><div><p className="eyebrow">THE SOCIAL SIDE</p><h1>A feed for discovery.</h1><p>Everyday inspiration, with room for something more personal.</p></div><span className="sample-label">Preview · Sample posts</span></div>
      <div className="social-layout"><div className="feed-stack">{posts.map(post => <article className="post-card" key={post.name}><header className="post-header"><span className={`avatar ${post.theme}`}>{post.initials}</span><div><h2>{post.name}</h2><p>{post.topic} <span aria-hidden="true">·</span> {post.time}</p></div><span className="post-demo">Sample</span></header><p className="post-copy">{post.text}</p><div className={`post-art ${post.theme}`}><span>{post.caption}</span><h3>{post.headline}</h3><div className="art-circles" aria-hidden="true" /></div><footer className="post-footer"><span>♡ {post.likes} likes</span><span>◯ {post.comments} comments</span><span>Demo post</span></footer></article>)}</div>
        <aside className="social-sidebar">
          <section className="sponsored-card" aria-label="Sponsored recommendation" aria-busy={loading}>
            <span className="eyebrow">Sponsored</span>
            {loading ? <p role="status">Finding a recommendation for you…</p>
              : error ? <p role="status">Recommendations are unavailable right now. Please try again later.</p>
                : sponsoredProduct ? <ProductCard
                  key={sponsoredProduct.id}
                  product={{
                    ...sponsoredProduct,
                    reason: coldStart ? 'Popular product for new users' : `Recommended because: ${sponsoredProduct.reason}`,
                  }}
                  showRecommendationInfo
                  buttonLabel="Shop Now"
                />
                  : <p role="status">No recommendations available yet.</p>}
          </section>
          <section className="panel"><h2>Discovery, connected.</h2><p>The shop and feed will eventually work together to bring your interests into focus.</p><Link className="text-link" to="/shop">Explore the shop <span aria-hidden="true">→</span></Link></section>
        </aside>
      </div>
    </section>
  )
}

