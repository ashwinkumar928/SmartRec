export const API_BASE_URL = 'http://localhost:5000'

export async function getRecommendations(userId = 1, { signal } = {}) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}/api/recommendations/${encodeURIComponent(userId)}`, { signal })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new Error('Unable to connect to the recommendation API. Please try again.', { cause: error })
  }
  if (!response.ok) throw new Error(`Unable to load recommendations (HTTP ${response.status}). Please try again.`)
  let data
  try {
    data = await response.json()
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new Error('The recommendation API returned invalid JSON.', { cause: error })
  }
  if (!data || !data.interestScores || typeof data.interestScores !== 'object' || Array.isArray(data.interestScores)
    || Object.values(data.interestScores).some(score => !Number.isFinite(score))
    || !Array.isArray(data.recommendations)
    || data.recommendations.some(product => !product || product.id == null || typeof product.name !== 'string'
      || !Number.isFinite(product.recommendationScore) || typeof product.reason !== 'string')) {
    throw new Error('The recommendation API returned an unexpected format.')
  }
  return data
}

export async function getProducts({ signal } = {}) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}/api/products`, { signal })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new Error('Unable to connect to the product API. Check that the backend is running at http://localhost:5000 and allows frontend requests.', { cause: error })
  }
  if (!response.ok) throw new Error(`Unable to load products (HTTP ${response.status}). Please try again.`)
  let products
  try {
    products = await response.json()
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new Error('The product API returned invalid JSON.', { cause: error })
  }
  if (!Array.isArray(products) || products.some(product => !product || typeof product !== 'object' || product.id == null || typeof product.name !== 'string')) {
    throw new Error('The product API returned an unexpected format. Expected an array of products with an id and name.')
  }
  return products
}


export async function getProductById(id, { signal } = {}) {
  if (id == null || String(id).trim() === '') {
    throw new Error('A product ID is required.')
  }
  let response
  try {
    response = await fetch(`${API_BASE_URL}/api/products/${encodeURIComponent(id)}`, { signal })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new Error('Unable to connect to the product API. Please check your connection and try again.', { cause: error })
  }
  if (response.status === 404) throw new Error('Product not found. It may no longer be available.')
  if (!response.ok) throw new Error(`Unable to load product (HTTP ${response.status}). Please try again.`)
  let product
  try {
    product = await response.json()
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new Error('The product API returned invalid JSON.', { cause: error })
  }
  if (!product || Array.isArray(product) || typeof product !== 'object' || product.id == null || typeof product.name !== 'string') {
    throw new Error('The product API returned an unexpected format. Expected a product with an id and name.')
  }
  return product
}
