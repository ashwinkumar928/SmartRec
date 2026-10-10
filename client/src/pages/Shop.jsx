import { useEffect, useState } from 'react'
import ProductCard from '../components/ProductCard'
import SearchBar from '../components/SearchBar'
import { getProducts, getRecommendations } from '../services/api'
import { trackEvent } from '../services/eventTracker'

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
    <section className="page-section">
      <div className="page-heading"><div><p className="eyebrow">THE SMARTREC SHOP</p><h1>Find your next favorite.</h1><p>A little browsing. A new discovery. Explore our product collection.</p></div><span className="pill">Product collection</span></div>
      <div className="shop-toolbar"><SearchBar value={search} onChange={setSearch} onSearch={handleSearch} /><span className="muted" role="status" aria-live="polite">{loading ? 'Loading products…' : error ? 'Products unavailable' : `${filteredProducts.length} of ${products.length} products`}</span></div>
      {loading ? <div className="product-grid" aria-hidden="true">{Array.from({ length: 4 }, (_, index) => <div className="skeleton-card" key={index}><div /><span /><span /></div>)}</div> : error ? <div className="empty-state" role="alert"><span className="state-symbol" aria-hidden="true">!</span><h2>We couldn’t load the collection</h2><p>{error}</p><button className="button primary" onClick={retry}>Try again</button></div> : filteredProducts.length ? <div className="product-grid">{filteredProducts.map(product => <ProductCard key={product.id} product={product} />)}</div> : <div className="empty-state"><span className="state-symbol" aria-hidden="true">⌕</span><h2>{products.length ? 'No matching products' : 'The collection is empty'}</h2><p>{products.length ? `No results for “${search}”. Try a brand, category, or color.` : 'Products will appear here when they are added to the catalog.'}</p>{search && <button className="button secondary" onClick={() => setSearch('')}>Clear search</button>}</div>}
      <p className="page-footnote">Browse freely. Press Enter to record a search. Refresh recommendations to see your latest interests.</p>
      <section className="shop-recommendations" aria-labelledby="recommendations-heading">
        <div className="recommendations-heading">
          <h2 id="recommendations-heading">Recommended For You</h2>
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
                  <li className="pill" key={category}>{category}: {score}</li>
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


