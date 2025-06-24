---
title: Advanced Guides
order: 3
---

# Advanced Guides

Explore advanced features and best practices for building with Kidolio.

## Custom Hooks

You can create custom hooks to reuse logic across components.

```jsx
import { useState } from 'react';

function useCounter() {
  const [count, setCount] = useState(0);
  const increment = () => setCount((c) => c + 1);
  return { count, increment };
}
```

## Theming

Kidolio supports dark and light themes out of the box. You can customize the theme using Tailwind CSS.

## Deployment

To deploy your Kidolio app, follow the deployment guide in the documentation.

## See Also
- [Quick Start](./quick-start.md)
- [API Reference](./api.md)
