import React from 'react';
import { createRoot } from 'react-dom/client';
import LawnCareDevPortal from './LawnCareDevPortal.jsx';

// To use a different API collection, import or define it here and pass it as the
// apiCollection prop. The component also accepts optional brandName and brandIcon props.
//
// Example:
//   import MY_API from './my-api-collection.js';
//   <LawnCareDevPortal apiCollection={MY_API} brandName="My API" brandIcon="🚀" />

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LawnCareDevPortal />
  </React.StrictMode>
);
