import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getRecommendations } from '../services/api'
import './SocialFeed.css'

const posts = [
  { initials: 'MJ', name: 'Maya Jones', topic: '@mayajones · Everyday style', time: '2 hours ago', image: '/social/street-lifestyle.jpg', alt: 'A lively city street with pedestrians, tall buildings, and yellow taxis', collection: 'The everyday edit', text: 'A little less effort, a little more you. A relaxed shirt and your favorite denim are always a good place to start.', likes: 124, comments: 6, tone: 'sand' },
  { initials: 'AL', name: 'Alex Lee', topic: '@alexoutside · Life in motion', time: '4 hours ago', image: '/social/morning-walk.jpg', alt: 'Sunlight falling across a quiet walking trail through green woodland', collection: 'Room to roam', text: 'Swapped screen time for a morning walk. Fresh air, a good playlist, and a pair that can keep up. Small routines make a difference.', likes: 238, comments: 14, tone: 'sage' },
  { initials: 'SK', name: 'Sam Kapoor', topic: '@samcurates · Weekend essentials', time: '6 hours ago', image: '/social/weekend-cafe.jpg', alt: 'A cozy cafe interior with warm pendant lights and a handwritten menu', collection: 'On repeat', text: 'The pieces you reach for again and again. Keeping this weekend simple with denim that goes with just about everything.', likes: 86, comments: 3, tone: 'blue' },
]
const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 })

function Icon({ name }) {
  const paths = {
    heart: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
    comment: 'M21 11.5a8.5 8.5 0 0 1-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5Z',
    share: 'm22 2-7 20-4-9-9-4 20-7ZM22 2 11 13',
    sparkle: 'm12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z',
    bag: 'M5 7h14l1 14H4L5 7Zm3 0V6a4 4 0 0 1 8 0v1',
  }
  return <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>
}

function FeedImage({ src, alt }) {
  const [failedSrc, setFailedSrc] = useState(null)
  return src && failedSrc !== src ? <img src={src} alt={alt} loading="lazy" decoding="async" onError={() => setFailedSrc(src)} /> : <div className="discover-image-fallback" role="img" aria-label={`${alt}. Image unavailable`}><Icon name="bag" /><span>Something worth discovering</span></div>
}

function SocialPost({ post }) {
  return <article className="discover-post">
    <header className="discover-post-header"><span className={`discover-avatar ${post.tone}`} aria-hidden="true">{post.initials}</span><div><h2>{post.name}</h2><p>{post.topic}</p></div><span className="discover-demo">Sample post</span></header>
    <div className="discover-post-image"><FeedImage src={post.image} alt={post.alt} /><span className="discover-collection">{post.collection}</span></div>
    <div className="discover-post-body">
      <div className="discover-actions" aria-label="Sample post interactions">{['heart', 'comment', 'share'].map((name, i) => <span key={name} title={`${['Likes', 'Comments', 'Share'][i]} · demo`}><Icon name={name} /><span className="sr-only">{['Likes', 'Comments', 'Share'][i]}</span></span>)}<small>{post.comments} comments</small></div>
      <p className="discover-likes">{post.likes} likes</p><p className="discover-caption"><strong>{post.name}</strong> {post.text}</p><p className="discover-timestamp">{post.time}</p>
    </div>
  </article>
}

function SponsoredProduct({ product, coldStart }) {
  const hasPrice = product.price != null && product.price !== '' && Number.isFinite(Number(product.price))
  return <>
    <div className="discover-ad-image"><FeedImage src={product.image} alt={product.name} /></div>
    <div className="discover-ad-body"><div className="discover-product-meta"><span>{product.brand || 'Unbranded'}</span><span><span aria-hidden="true">★</span> {product.rating != null ? `${product.rating} / 5` : 'Unrated'}</span></div><h3>{product.name}</h3><p className="discover-price">{hasPrice ? currency.format(Number(product.price)) : 'Price unavailable'}</p>
      <div className="discover-reason"><p><Icon name="sparkle" /> Why you’re seeing this</p><p>{coldStart ? 'Popular product for new users' : product.reason}</p><span>Recommendation score: <strong>{product.recommendationScore}</strong></span></div>
      <Link className="button primary discover-shop" to={`/product/${encodeURIComponent(product.id)}`}>Shop Now <span aria-hidden="true">↗</span></Link>
    </div>
  </>
}

export default function SocialFeed() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  useEffect(() => {
    const controller = new AbortController()
    getRecommendations(1, { signal: controller.signal })
      .then(result => { if (!controller.signal.aborted) setData(result) })
      .catch(() => { if (!controller.signal.aborted) setError(true) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [])
  const sponsoredProduct = data?.recommendations?.[0]
  const interests = Object.entries(data?.interestScores ?? {}).sort((a, b) => b[1] - a[1])
  const maxInterest = Math.max(1, ...interests.map(([, score]) => score))
  return <section className="page-section discover-page">
    <header className="discover-heading"><p className="eyebrow">A LITTLE INSPIRATION, EVERY DAY</p><h1>Discover</h1><p>A personalized feed shaped by what you explore.</p></header>
    <div className="discover-tabs" aria-label="Feed categories"><span className="is-active" aria-current="true"><Icon name="sparkle" /> For You</span><span>Trending <small>Soon</small></span><span>Following <small>Soon</small></span></div>
    <div className="discover-layout">
      <div className="discover-feed"><h2 className="sr-only">Discovery feed</h2>{posts.map(post => <SocialPost key={post.name} post={post} />)}<p className="discover-feed-note">A little inspiration goes a long way. You’re all caught up.</p></div>
      <aside className="discover-sidebar" aria-label="For you recommendations">
        <div className="discover-sidebar-heading"><h2>Picked for you</h2><Icon name="sparkle" /></div>
        <section className="discover-ad" aria-label="Sponsored recommendation" aria-busy={loading}>
          <header className="discover-ad-header"><span className="discover-ad-mark" aria-hidden="true">S.</span><div><strong>SmartRec finds</strong><p>Sponsored</p></div><span className="discover-ad-tag">For you</span></header>
          {loading ? <div className="discover-loading" role="status"><span className="sr-only">Finding a recommendation for you…</span><div className="discover-skeleton-image" /><div className="discover-skeleton-line" /><div className="discover-skeleton-line short" /><div className="discover-skeleton-button" /></div>
            : error ? <p className="discover-state" role="status">Recommendations are unavailable right now. Please try again later. You can still <Link to="/shop">explore the shop</Link>.</p>
              : sponsoredProduct ? <SponsoredProduct key={sponsoredProduct.id} product={sponsoredProduct} coldStart={interests.length === 0} />
                : <p className="discover-state" role="status">No recommendations available yet. Discover something new in <Link to="/shop">the shop</Link>.</p>}
        </section>
        <section className="discover-insight" aria-busy={loading}><span className="eyebrow">SMARTREC INSIGHTS</span><h2>Why this feed?</h2>
          {loading ? <p>Gathering your interests…</p> : error ? <p>Your interests are unavailable right now. Try again on your next visit.</p> : interests.length ? <><p>Your recent activity suggests interest in:</p><ul>{interests.map(([category, score]) => <li key={category}><div><span>{category}</span><strong>{score}</strong></div><progress aria-label={`${category}: ${score} interest points`} value={Math.max(0, score)} max={maxInterest} /></li>)}</ul><p className="discover-insight-note">Shaped by what you search, view, and add to your cart.</p></> : <p>Explore products to personalize your feed.</p>}
          <Link className="text-link" to="/shop">Explore the shop <span aria-hidden="true">→</span></Link>
        </section><p className="discover-sidebar-note">Fresh inspiration. More personal discoveries.</p>
      </aside>
    </div>
  </section>
}
