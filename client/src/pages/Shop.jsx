import { useEffect, useState } from 'react'
import ProductCard from '../components/ProductCard'
import SearchBar from '../components/SearchBar'
import { getProducts, getRecommendations } from '../services/api'
import { trackEvent } from '../services/eventTracker'
import './Shop.css'

export default function Shop() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [recommendationData, setRecommendationData] = useState(null)
  const [recommendationsLoading, setRecommendationsLoading] = useState(true)
  const [recommendationsError, setRecommendationsError] = useState('')
  const [recommendationAttempt, setRecommendationAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    async function loadRecommendations() {
      try {
        const data = await getRecommendations(1, { signal: controller.signal })
        if (!controller.signal.aborted) setRecommendationData(data)
      } catch (err) {
        if (!controller.signal.aborted) setRecommendationsError(err.message)
      } finally {
        if (!controller.signal.aborted) setRecommendationsLoading(false)
      }
    }
    loadRecommendations()
    return () => controller.abort()
  }, [recommendationAttempt])

  function refreshRecommendations() {
    setRecommendationsError('')
    setRecommendationsLoading(true)
    setRecommendationAttempt(value => value + 1)
  }

  useEffect(() => {
    const controller = new AbortController()
    async function loadProducts() {
      try {
        const data = await getProducts({ signal: controller.signal })
        if (!controller.signal.aborted) setProducts(data)
      } catch (err) {
        if (!controller.signal.aborted) setError(err.message)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    loadProducts()
    return () => controller.abort()
  }, [attempt])

  const searchWords = search.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const filteredProducts = products.filter(product => {
    const searchableText = [
      product.name,
      product.brand,
      product.category,
      product.color,
      ...(Array.isArray(product.tags) ? product.tags : [product.tags]),
    ].map(value => String(value ?? '')).join(' ').toLowerCase()

    return searchWords.every(word => searchableText.includes(word))
  })

  function handleSearch(searchTerm) {
    return trackEvent({ userId: 1, eventType: 'SEARCH', searchQuery: searchTerm })
  }
  function retry() {
    setError('')
    setLoading(true)
    setAttempt(value => value + 1)
  }

  return (
    <section className="page-section shop-page">
      <header className="shop-hero">
        <div className="shop-hero-copy">
          <p className="eyebrow">SMARTREC · DISCOVERY MADE PERSONAL</p>
          <h1>Discover products <span>tailored to you.</span></h1>
          <p>From everyday essentials to your next favorite find. SmartRec learns from your searches, views, and cart activity to bring your interests into focus.</p>
          <div className="button-row">
            <a className="button primary" href="#all-products">Explore Products <span aria-hidden="true">↗</span></a>
            <a className="button secondary" href="#recommendations">View Recommendations</a>
          </div>
          <p className="shop-hero-note"><span aria-hidden="true">✧</span> A collection to explore. Recommendations that grow with you.</p>
        </div>
        <div className="shop-hero-visual" aria-label="A look inside the collection">
          <div className="shop-visual-heading"><span className="eyebrow">IN THE COLLECTION</span><span className="pill">Curated for discovery</span></div>
          <div className="shop-hero-products">
            {products.slice(0, 2).map(product => <ProductCard key={product.id} product={product} />)}
            {!products.length && <div className="shop-visual-placeholder"><span aria-hidden="true">✧</span><h2>A little curiosity.<br />A new favorite.</h2><p>{loading ? 'Getting the collection ready…' : 'Your next discovery starts here.'}</p></div>}
          </div>
        </div>
      </header>
      <section className="shop-categories" aria-labelledby="categories-heading">
        <div className="shop-section-heading"><div><p className="eyebrow">FIND YOUR EVERYDAY</p><h2 id="categories-heading">Shop by Category</h2></div><span className="muted">A good place to start</span></div>
        <div className="category-grid">
          {[
            { name: 'Shirts', subtitle: 'Easy layers. Everyday style.', path: 'M8 3 3 6l2 5 3-1v11h8V10l3 1 2-5-5-3a4 4 0 0 1-8 0Z' },
            { name: 'Shoes', subtitle: 'Find your next step.', path: 'M4 5h5l2 7 9 4v4H3v-7l1-8Zm7 7-3 2m6 0-2 2' },
            { name: 'Jeans', subtitle: 'Made for your daily rotation.', path: 'M6 3h12l2 18h-7l-1-11-1 11H4L6 3Zm0 4h12M12 3v7' },
            { name: 'Electronics', subtitle: 'Small upgrades. More possibility.', path: 'M3 4h18v13H3V4Zm5 17h8m-4-4v4' },
          ].map(category => <a className="category-card" href="#all-products" key={category.name} onClick={() => setSearch(category.name)}>
            <span className="category-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={category.path} /></svg></span>
            <span><strong>{category.name}</strong><small>{category.subtitle}</small></span><span className="category-arrow" aria-hidden="true">↗</span>
          </a>)}
        </div>
      </section>
      <section id="all-products" className="shop-collection" aria-labelledby="collection-heading">
        <div className="shop-section-heading"><div><p className="eyebrow">THE SMARTREC COLLECTION</p><h2 id="collection-heading">All Products</h2><p>Good finds, all in one place.</p></div></div>
      <div className="shop-toolbar"><SearchBar value={search} onChange={setSearch} onSearch={handleSearch} /><span className="muted" role="status" aria-live="polite">{loading ? 'Loading products…' : error ? 'Products unavailable' : `${filteredProducts.length} of ${products.length} products`}</span></div>
      {loading ? <div className="product-grid" aria-hidden="true">{Array.from({ length: 4 }, (_, index) => <div className="skeleton-card" key={index}><div /><span /><span /></div>)}</div> : error ? <div className="empty-state" role="alert"><span className="state-symbol" aria-hidden="true">!</span><h2>We couldn’t load the collection</h2><p>{error}</p><button className="button primary" onClick={retry}>Try again</button></div> : filteredProducts.length ? <div className="product-grid">{filteredProducts.map(product => <ProductCard key={product.id} product={product} />)}</div> : <div className="empty-state"><span className="state-symbol" aria-hidden="true">⌕</span><h2>{products.length ? 'No matching products' : 'The collection is empty'}</h2><p>{products.length ? `No results for “${search}”. Try a brand, category, or color.` : 'Products will appear here when they are added to the catalog.'}</p>{search && <button className="button secondary" onClick={() => setSearch('')}>Clear search</button>}</div>}
      <p className="page-footnote">Browse freely. Press Enter to record a search. Refresh recommendations to see your latest interests.</p>
      </section>
      <section id="recommendations" className="shop-recommendations" aria-labelledby="recommendations-heading">
        <div className="recommendations-heading">
          <div className="shop-recommendation-title"><p className="eyebrow">YOUR NEXT DISCOVERY</p><h2 id="recommendations-heading">Recommended For You <span className="pill">Personalized</span></h2></div>
          <button className="button secondary" type="button" onClick={refreshRecommendations} disabled={recommendationsLoading}>
            Refresh Recommendations
          </button>
        </div>
        {recommendationsLoading ? (
          <p className="muted" role="status">Loading recommendations…</p>
        ) : recommendationsError ? (
          <div className="empty-state" role="alert"><p>{recommendationsError}</p></div>
        ) : recommendationData && (
          <>
            <p className="recommendations-subtitle">{Object.keys(recommendationData.interestScores).length ? 'Based on your interests' : 'Popular products for you'}</p>
            <div className="panel current-interests">
              <h3>Your Current Interests</h3>
              {Object.keys(recommendationData.interestScores).length ? (
                <ul>{Object.entries(recommendationData.interestScores).map(([category, score]) => (
                  <li className="pill" key={category}>{category} · {score}</li>
                ))}</ul>
              ) : <p>No strong interests yet</p>}
            </div>
            {recommendationData.recommendations.length ? (
              <div className="product-grid">{recommendationData.recommendations.map(product => (
                <ProductCard key={product.id} product={product} showRecommendationInfo />
              ))}</div>
            ) : <p className="muted">No recommendations available yet.</p>}
          </>
        )}
      </section>
    </section>
  )
}


