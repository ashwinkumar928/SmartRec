import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProductById } from '../services/api'
import { trackEvent } from '../services/eventTracker'

const priceFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 2,
})

export default function ProductDetails() {
  const { id } = useParams()
  // A different URL id gets fresh request state and its own view guard.
  return <ProductDetailsContent key={id} id={id} />
}

function ProductDetailsContent({ id }) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [failedImage, setFailedImage] = useState(null)
  const trackedProductRef = useRef(null)
  const cartRequestRef = useRef(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const [cartMessage, setCartMessage] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    async function loadProduct() {
      try {
        const data = await getProductById(id, { signal: controller.signal })
        if (!controller.signal.aborted) setProduct(data)
      } catch (err) {
        if (!controller.signal.aborted) setError(err.message)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    loadProduct()
    return () => controller.abort()
  }, [id, attempt])

  useEffect(() => {
    if (!product || trackedProductRef.current === product.id) return
    // Set before sending so effect replays cannot post a second event.
    trackedProductRef.current = product.id
    void trackEvent({
      userId: 1,
      eventType: 'VIEW',
      productId: product.id,
      category: product.category,
    })
  }, [product])

  async function handleAddToCart() {
    if (!product || cartRequestRef.current) return
    // Lock immediately, including clicks before React updates the button.
    cartRequestRef.current = true
    setAddingToCart(true)
    setCartMessage('')
    try {
      const event = await trackEvent({
        userId: 1,
        eventType: 'CART',
        productId: product.id,
        category: product.category,
      })
      // trackEvent returns undefined when the request fails.
      setCartMessage(event ? 'Added to cart' : 'Unable to add to cart. Please try again.')
    } finally {
      cartRequestRef.current = false
      setAddingToCart(false)
    }
  }

  function retry() {
    setError('')
    setLoading(true)
    setAttempt(value => value + 1)
  }

  return (
    <section className="page-section">
      <Link className="text-link details-back" to="/shop">← Back to Shop</Link>
      {loading ? (
        <div className="empty-state" role="status"><p>Loading product…</p></div>
      ) : error ? (
        <div className="empty-state" role="alert">
          <h1>Unable to load product</h1>
          <p>{error}</p>
          <button className="button primary" onClick={retry}>Try again</button>
        </div>
      ) : product && (
        <article className="product-details">
          <div className="details-image">
            {product.image && failedImage !== product.image ? (
              <img src={product.image} alt={product.name} onError={() => setFailedImage(product.image)} />
            ) : (
              <div className="image-fallback"><span aria-hidden="true">◇</span><span>Image unavailable</span></div>
            )}
          </div>
          <div className="details-content">
            <p className="eyebrow">{product.brand || 'Unbranded'}</p>
            <h1>{product.name}</h1>
            <span className="rating"><span aria-hidden="true">★</span> {product.rating != null ? `${product.rating} / 5` : 'Unrated'}</span>
            <p className="details-price">
              {product.price != null && product.price !== '' && Number.isFinite(Number(product.price))
                ? priceFormatter.format(Number(product.price)) : 'Price unavailable'}
            </p>
            <dl className="details-attributes">
              <div><dt>Category</dt><dd>{product.category || 'Not specified'}</dd></div>
              <div><dt>Color</dt><dd>{product.color || 'Not specified'}</dd></div>
            </dl>
            <div className="details-tags">
              <h2>Tags</h2>
              {Array.isArray(product.tags) && product.tags.length ? (
                <ul>{product.tags.map((tag, index) => <li className="pill" key={`${tag}-${index}`}>{tag}</li>)}</ul>
              ) : <p>No tags available.</p>}
            </div>
            <button className="button primary details-cart" type="button" disabled={addingToCart} onClick={handleAddToCart} aria-describedby="cart-status" aria-busy={addingToCart}>
              {addingToCart ? 'Adding…' : 'Add to Cart'}
            </button>
            <p id="cart-status" className="details-note" role="status">{cartMessage}</p>
          </div>
        </article>
      )}
    </section>
  )
}
