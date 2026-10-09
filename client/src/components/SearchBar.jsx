export default function SearchBar({ value, onChange, onSearch }) {
  function handleSubmit(event) {
    event.preventDefault()
    const searchTerm = value.trim()
    if (!searchTerm) return
    return onSearch?.(searchTerm)
  }

  return (
    <form className="search-field" role="search" onSubmit={handleSubmit}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg>
      <label className="sr-only" htmlFor="product-search">Search products by name, category, brand, tag, or color</label>
      <input id="product-search" type="search" value={value} onChange={event => onChange(event.target.value)} placeholder="Search products, brands, colors…" />
      {value && <button type="button" className="text-button" onClick={() => onChange('')}>Clear</button>}
    </form>
  )
}


