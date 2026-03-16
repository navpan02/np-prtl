import React from 'react';
import { createRoot } from 'react-dom/client';
import LawnCareDevPortal from './LawnCareDevPortal.jsx';
import NP_LAWN_API_COLLECTION from './npLawnApiCollection.js';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LawnCareDevPortal
      apiCollection={NP_LAWN_API_COLLECTION}
      brandName="NP Lawn API"
      brandIcon="🌿"
    />
  </React.StrictMode>
);
