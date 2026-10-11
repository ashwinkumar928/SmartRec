import { useState } from 'react'

import { Link } from 'react-router-dom'

const priceFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 })

export default function ProductCard({ product, showRecommendationInfo = false, buttonLabel = 'View Product' }) {
  const [failedImage, setFailedImage] = useState(null)
  const hasPrice = product.price != null && product.price !== '' && Number.isFinite(Number(product.price))
  return (
    <article className="product-card">
      <div className="product-image">
        {product.image && failedImage !== product.image ? <img src={product.image} alt={product.name} loading="lazy" onError={() => setFailedImage(product.image)} /> : <div className="image-fallback"><span aria-hidden="true">◇</span><span>Image unavailable</span></div>}
        <span className="category-label">{product.category || 'Product'}</span>
      </div>
      <div className="product-body">
        <div className="product-meta"><span className="eyebrow">{product.brand || 'Unbranded'}</span><span className="rating"><span aria-hidden="true">★</span> {product.rating != null ? `${product.rating} / 5` : 'Unrated'}</span></div>
        <h2>{product.name}</h2>
        <p className="product-price">{hasPrice ? priceFormatter.format(Number(product.price)) : 'Price unavailable'}</p>
        {showRecommendationInfo && (
          <div className="recommendation-info">
            <span>Score: {product.recommendationScore}</span>
            <p>{product.reason}</p>
          </div>
        )}
        <Link className="button product-button" to={`/product/${encodeURIComponent(product.id)}`}>{buttonLabel} <span aria-hidden="true">↗</span></Link>
      </div>
    </article>
  )
}

