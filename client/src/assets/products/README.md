Place local product images here and import them with Vite:

```jsx
import shirtImage from '../assets/products/shirt.jpg'

<ProductCard product={product} imageSrc={shirtImage} />
```

`imageSrc` is optional; cards use the API's `product.image` by default.
Both remote URLs and imported image URLs are supported. Missing or failed
images display the existing “Image unavailable” fallback. No catalog data
or remote images are copied into this directory.
