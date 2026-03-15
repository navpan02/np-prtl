import React, { useState, useEffect, useMemo } from 'react';

// ============================================
// LAWN CARE MARKETPLACE - DEVELOPER PORTAL
// ============================================

// API Collection Data (parsed from Postman)
const API_COLLECTION = {
  info: {
    name: "Lawn Care Marketplace",
    description: "API collection for the Lawn Care Marketplace — covers auth, user registration, and quote management.",
    baseUrl: "https://api.yourlawncaremarketplace.com"
  },
  auth: {
    type: "apikey",
    headerName: "x-api-key"
  },
  endpoints: [
    {
      id: "signup",
      folder: "Auth",
      name: "Sign Up",
      method: "POST",
      path: "/auth/signup",
      description: "Register a new user. Role can be 'customer' or 'provider'.",
      headers: [{ key: "Content-Type", value: "application/json" }],
      body: {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@example.com",
        password: "SecurePass123!",
        role: "customer",
        phone: "615-555-0100",
        address: {
          street: "123 Main St",
          city: "Nolensville",
          state: "TN",
          zip: "37135"
        }
      },
      sampleResponse: {
        status: 201,
        body: {
          userId: "usr_abc123xyz",
          email: "jane.smith@example.com",
          role: "customer",
          createdAt: "2026-03-15T10:30:00Z"
        }
      }
    },
    {
      id: "login",
      folder: "Auth",
      name: "Login",
      method: "POST",
      path: "/auth/login",
      description: "Authenticate an existing user and retrieve an API key.",
      headers: [{ key: "Content-Type", value: "application/json" }],
      body: {
        email: "jane.smith@example.com",
        password: "SecurePass123!"
      },
      sampleResponse: {
        status: 200,
        body: {
          userId: "usr_abc123xyz",
          apiKey: "sk_live_xxxxxxxxxxxx",
          expiresAt: "2026-04-15T10:30:00Z"
        }
      }
    },
    {
      id: "submit-quote",
      folder: "Quotes",
      name: "Submit Quote",
      method: "POST",
      path: "/quotes",
      description: "Submit a new service quote request. The API key is sent via the x-api-key header.",
      headers: [{ key: "Content-Type", value: "application/json" }],
      requiresAuth: true,
      body: {
        customerId: "usr_abc123xyz",
        serviceType: "lawn_mowing",
        propertySize: "medium",
        frequency: "weekly",
        preferredDate: "2026-03-22",
        notes: "Please bring your own equipment. Gate code is 1234.",
        address: {
          street: "123 Main St",
          city: "Nolensville",
          state: "TN",
          zip: "37135"
        }
      },
      sampleResponse: {
        status: 201,
        body: {
          quoteId: "qt_789def456",
          customerId: "usr_abc123xyz",
          serviceType: "lawn_mowing",
          status: "pending",
          estimatedPrice: null,
          createdAt: "2026-03-15T11:00:00Z"
        }
      }
    },
    {
      id: "get-quotes",
      folder: "Quotes",
      name: "Get All Quotes",
      method: "GET",
      path: "/quotes",
      description: "Retrieve all quotes for a customer. Filter by status using the query param.",
      requiresAuth: true,
      queryParams: [
        { key: "customerId", value: "usr_abc123xyz", description: "Filter quotes by customer ID" },
        { key: "status", value: "all", description: "Filter by status: all | pending | accepted | rejected" }
      ],
      sampleResponse: {
        status: 200,
        body: {
          quotes: [
            {
              quoteId: "qt_789def456",
              serviceType: "lawn_mowing",
              status: "pending",
              estimatedPrice: 75.00,
              createdAt: "2026-03-15T11:00:00Z"
            },
            {
              quoteId: "qt_111ghi222",
              serviceType: "hedge_trimming",
              status: "accepted",
              estimatedPrice: 120.00,
              createdAt: "2026-03-10T09:00:00Z"
            }
          ],
          total: 2
        }
      }
    },
    {
      id: "get-quote-by-id",
      folder: "Quotes",
      name: "Get Quote by ID",
      method: "GET",
      path: "/quotes/{quoteId}",
      description: "Retrieve a single quote by its ID.",
      requiresAuth: true,
      pathParams: [{ key: "quoteId", value: "qt_789def456", description: "The unique quote identifier" }],
      sampleResponse: {
        status: 200,
        body: {
          quoteId: "qt_789def456",
          customerId: "usr_abc123xyz",
          serviceType: "lawn_mowing",
          propertySize: "medium",
          frequency: "weekly",
          preferredDate: "2026-03-22",
          status: "pending",
          estimatedPrice: 75.00,
          provider: null,
          notes: "Please bring your own equipment. Gate code is 1234.",
          address: {
            street: "123 Main St",
            city: "Nolensville",
            state: "TN",
            zip: "37135"
          },
          createdAt: "2026-03-15T11:00:00Z",
          updatedAt: "2026-03-15T11:00:00Z"
        }
      }
    }
  ]
};

// Code snippet generators
const generateCurl = (endpoint, baseUrl, apiKey) => {
  let curl = `curl -X ${endpoint.method} "${baseUrl}${endpoint.path}"`;
  
  if (endpoint.requiresAuth && apiKey) {
    curl += ` \\\n  -H "x-api-key: ${apiKey}"`;
  }
  
  endpoint.headers?.forEach(h => {
    curl += ` \\\n  -H "${h.key}: ${h.value}"`;
  });
  
  if (endpoint.body) {
    curl += ` \\\n  -d '${JSON.stringify(endpoint.body, null, 2)}'`;
  }
  
  return curl;
};

const generateJavaScript = (endpoint, baseUrl, apiKey) => {
  const headers = {};
  if (endpoint.requiresAuth && apiKey) headers['x-api-key'] = apiKey;
  endpoint.headers?.forEach(h => { headers[h.key] = h.value; });
  
  let code = `const response = await fetch("${baseUrl}${endpoint.path}", {
  method: "${endpoint.method}",
  headers: ${JSON.stringify(headers, null, 4).replace(/\n/g, '\n  ')}`;
  
  if (endpoint.body) {
    code += `,
  body: JSON.stringify(${JSON.stringify(endpoint.body, null, 4).replace(/\n/g, '\n  ')})`;
  }
  
  code += `
});

const data = await response.json();
console.log(data);`;
  
  return code;
};

const generatePython = (endpoint, baseUrl, apiKey) => {
  let code = `import requests

url = "${baseUrl}${endpoint.path}"
headers = {`;
  
  if (endpoint.requiresAuth && apiKey) {
    code += `\n    "x-api-key": "${apiKey}",`;
  }
  endpoint.headers?.forEach(h => {
    code += `\n    "${h.key}": "${h.value}",`;
  });
  code += `\n}`;
  
  if (endpoint.body) {
    code += `\npayload = ${JSON.stringify(endpoint.body, null, 4)}`;
    code += `\n\nresponse = requests.${endpoint.method.toLowerCase()}(url, headers=headers, json=payload)`;
  } else {
    code += `\n\nresponse = requests.${endpoint.method.toLowerCase()}(url, headers=headers)`;
  }
  
  code += `\nprint(response.json())`;
  
  return code;
};

// Method badge colors
const methodColors = {
  GET: { bg: '#059669', text: '#ffffff' },
  POST: { bg: '#2563eb', text: '#ffffff' },
  PUT: { bg: '#d97706', text: '#ffffff' },
  PATCH: { bg: '#7c3aed', text: '#ffffff' },
  DELETE: { bg: '#dc2626', text: '#ffffff' }
};

// ============================================
// COMPONENTS
// ============================================

const MethodBadge = ({ method }) => (
  <span style={{
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
    fontFamily: "'JetBrains Mono', monospace",
    backgroundColor: methodColors[method]?.bg || '#666',
    color: methodColors[method]?.text || '#fff',
    letterSpacing: '0.5px'
  }}>
    {method}
  </span>
);

const CodeBlock = ({ code, language }) => (
  <div style={{
    position: 'relative',
    backgroundColor: '#1a1f2e',
    borderRadius: '12px',
    overflow: 'hidden',
    marginTop: '8px'
  }}>
    <div style={{
      padding: '8px 14px',
      backgroundColor: '#252b3d',
      fontSize: '11px',
      color: '#8b95a5',
      fontFamily: "'JetBrains Mono', monospace",
      textTransform: 'uppercase',
      letterSpacing: '1px'
    }}>
      {language}
    </div>
    <pre style={{
      margin: 0,
      padding: '16px',
      overflow: 'auto',
      maxHeight: '300px',
      fontSize: '13px',
      lineHeight: '1.6',
      color: '#e2e8f0',
      fontFamily: "'JetBrains Mono', monospace"
    }}>
      {code}
    </pre>
    <button
      onClick={() => navigator.clipboard.writeText(code)}
      style={{
        position: 'absolute',
        top: '8px',
        right: '12px',
        padding: '6px 12px',
        backgroundColor: 'transparent',
        border: '1px solid #3d4556',
        borderRadius: '6px',
        color: '#8b95a5',
        fontSize: '11px',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
      onMouseOver={e => { e.target.style.backgroundColor = '#3d4556'; e.target.style.color = '#fff'; }}
      onMouseOut={e => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#8b95a5'; }}
    >
      Copy
    </button>
  </div>
);

// Navigation
const Navigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'explorer', label: 'API Explorer', icon: '📚' },
    { id: 'playground', label: 'Playground', icon: '🧪' },
    { id: 'request-key', label: 'Get API Key', icon: '🔑' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊' }
  ];
  
  return (
    <nav style={{
      display: 'flex',
      gap: '4px',
      padding: '8px',
      backgroundColor: 'rgba(255,255,255,0.7)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
    }}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          style={{
            padding: '12px 20px',
            border: 'none',
            borderRadius: '12px',
            backgroundColor: activeTab === tab.id ? '#166534' : 'transparent',
            color: activeTab === tab.id ? '#fff' : '#374151',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};

// Home Page
const FOLDER_ICONS = ['📋', '📝', '⚡', '🔧', '📊', '🔐', '🌐', '📡'];

const HomePage = ({ setActiveTab, collection }) => {
  const folders = [...new Set(collection.endpoints.map(ep => ep.folder))];
  const featureCards = folders.map((folder, i) => {
    const count = collection.endpoints.filter(ep => ep.folder === folder).length;
    return {
      icon: FOLDER_ICONS[i % FOLDER_ICONS.length],
      title: folder,
      desc: `${count} endpoint${count !== 1 ? 's' : ''}`
    };
  });

  return (
  <div style={{ maxWidth: '900px', margin: '0 auto' }}>
    <div style={{
      textAlign: 'center',
      padding: '60px 40px',
      background: 'linear-gradient(135deg, #166534 0%, #15803d 50%, #22c55e 100%)',
      borderRadius: '24px',
      color: '#fff',
      marginBottom: '40px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 5 Q35 15 30 25 Q25 15 30 5\' fill=\'%23ffffff10\'/%3E%3C/svg%3E")',
        backgroundSize: '60px 60px',
        opacity: 0.3
      }} />
      <h1 style={{
        fontSize: '48px',
        fontWeight: '800',
        margin: '0 0 16px 0',
        fontFamily: "'Playfair Display', Georgia, serif",
        position: 'relative'
      }}>
        {collection.info.name}
      </h1>
      <p style={{
        fontSize: '20px',
        opacity: 0.95,
        margin: 0,
        fontWeight: '400',
        position: 'relative'
      }}>
        {collection.info.description}
      </p>
    </div>

    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${Math.min(featureCards.length, 3)}, 1fr)`,
      gap: '20px',
      marginBottom: '40px'
    }}>
      {featureCards.map((item, i) => (
        <div key={i} style={{
          padding: '28px',
          backgroundColor: '#fff',
          borderRadius: '16px',
          border: '1px solid #e5e7eb',
          textAlign: 'center',
          transition: 'all 0.3s ease',
          cursor: 'default'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>{item.icon}</div>
          <h3 style={{ margin: '0 0 8px 0', color: '#166534', fontSize: '18px' }}>{item.title}</h3>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', lineHeight: '1.5' }}>{item.desc}</p>
        </div>
      ))}
    </div>
    
    <div style={{
      backgroundColor: '#f0fdf4',
      borderRadius: '16px',
      padding: '32px',
      border: '1px solid #bbf7d0'
    }}>
      <h2 style={{ margin: '0 0 20px 0', color: '#166534', fontSize: '24px' }}>🚀 Quick Start</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {[
          { step: 1, text: 'Request an API key', action: 'Get API Key', tab: 'request-key' },
          { step: 2, text: 'Explore available endpoints', action: 'API Explorer', tab: 'explorer' },
          { step: 3, text: 'Test endpoints live', action: 'Playground', tab: 'playground' }
        ].map(item => (
          <div key={item.step} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '16px 20px',
            backgroundColor: '#fff',
            borderRadius: '12px',
            border: '1px solid #dcfce7'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#166534',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '16px'
            }}>
              {item.step}
            </div>
            <span style={{ flex: 1, color: '#374151', fontSize: '16px' }}>{item.text}</span>
            <button
              onClick={() => setActiveTab(item.tab)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#166534',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              {item.action} →
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
  );
};

// API Explorer
const APIExplorer = ({ onSelectEndpoint, selectedEndpoint, apiKey, collection }) => {
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');

  const folders = useMemo(() => {
    const grouped = {};
    collection.endpoints.forEach(ep => {
      if (!grouped[ep.folder]) grouped[ep.folder] = [];
      grouped[ep.folder].push(ep);
    });
    return grouped;
  }, [collection]);

  const filteredEndpoints = useMemo(() => {
    return collection.endpoints.filter(ep => {
      const matchesSearch = search === '' ||
        ep.name.toLowerCase().includes(search.toLowerCase()) ||
        ep.path.toLowerCase().includes(search.toLowerCase());
      const matchesMethod = methodFilter === 'ALL' || ep.method === methodFilter;
      return matchesSearch && matchesMethod;
    });
  }, [search, methodFilter, collection]);
  
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', height: 'calc(100vh - 200px)' }}>
      {/* Sidebar */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
          <input
            type="text"
            placeholder="🔍 Search endpoints..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '10px',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
            {['ALL', 'GET', 'POST', 'PUT', 'DELETE'].map(m => (
              <button
                key={m}
                onClick={() => setMethodFilter(m)}
                style={{
                  padding: '6px 12px',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  backgroundColor: methodFilter === m ? '#166534' : '#f3f4f6',
                  color: methodFilter === m ? '#fff' : '#374151'
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        
        <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
          {Object.keys(folders).map(folder => (
            <div key={folder} style={{ marginBottom: '16px' }}>
              <div style={{
                fontSize: '11px',
                fontWeight: '700',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                padding: '8px 12px'
              }}>
                📁 {folder}
              </div>
              {folders[folder]
                .filter(ep => filteredEndpoints.includes(ep))
                .map(ep => (
                  <button
                    key={ep.id}
                    onClick={() => onSelectEndpoint(ep)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: 'none',
                      borderRadius: '10px',
                      backgroundColor: selectedEndpoint?.id === ep.id ? '#f0fdf4' : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '4px',
                      transition: 'background-color 0.15s'
                    }}
                  >
                    <MethodBadge method={ep.method} />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{ep.name}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280', fontFamily: "'JetBrains Mono', monospace" }}>{ep.path}</div>
                    </div>
                  </button>
                ))}
            </div>
          ))}
        </div>
      </div>
      
      {/* Detail Panel */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        border: '1px solid #e5e7eb',
        overflow: 'auto',
        padding: '28px'
      }}>
        {selectedEndpoint ? (
          <EndpointDetail endpoint={selectedEndpoint} apiKey={apiKey} baseUrl={collection.info.baseUrl} />
        ) : (
          <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9ca3af'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👈</div>
            <p style={{ fontSize: '16px' }}>Select an endpoint to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Endpoint Detail
const EndpointDetail = ({ endpoint, apiKey, baseUrl }) => {
  const [activeSnippet, setActiveSnippet] = useState('curl');
  
  const snippets = {
    curl: generateCurl(endpoint, baseUrl, apiKey),
    javascript: generateJavaScript(endpoint, baseUrl, apiKey),
    python: generatePython(endpoint, baseUrl, apiKey)
  };
  
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
        <MethodBadge method={endpoint.method} />
        <code style={{
          fontSize: '18px',
          fontFamily: "'JetBrains Mono', monospace",
          color: '#1f2937',
          backgroundColor: '#f3f4f6',
          padding: '8px 16px',
          borderRadius: '8px'
        }}>
          {endpoint.path}
        </code>
        {endpoint.requiresAuth && (
          <span style={{
            padding: '6px 12px',
            backgroundColor: '#fef3c7',
            color: '#92400e',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            🔐 Auth Required
          </span>
        )}
      </div>
      
      <h2 style={{ margin: '0 0 8px 0', color: '#166534', fontSize: '24px' }}>{endpoint.name}</h2>
      <p style={{ color: '#6b7280', fontSize: '15px', lineHeight: '1.6', marginBottom: '28px' }}>
        {endpoint.description}
      </p>
      
      {/* Parameters */}
      {(endpoint.pathParams || endpoint.queryParams) && (
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '16px' }}>Parameters</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>Name</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>Type</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>Example</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>Description</th>
              </tr>
            </thead>
            <tbody>
              {endpoint.pathParams?.map(p => (
                <tr key={p.key}>
                  <td style={{ padding: '10px 12px', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', borderBottom: '1px solid #f3f4f6' }}>{p.key}</td>
                  <td style={{ padding: '10px 12px', fontSize: '13px', borderBottom: '1px solid #f3f4f6' }}><span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>path</span></td>
                  <td style={{ padding: '10px 12px', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: '#6b7280', borderBottom: '1px solid #f3f4f6' }}>{p.value}</td>
                  <td style={{ padding: '10px 12px', fontSize: '13px', color: '#6b7280', borderBottom: '1px solid #f3f4f6' }}>{p.description}</td>
                </tr>
              ))}
              {endpoint.queryParams?.map(p => (
                <tr key={p.key}>
                  <td style={{ padding: '10px 12px', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', borderBottom: '1px solid #f3f4f6' }}>{p.key}</td>
                  <td style={{ padding: '10px 12px', fontSize: '13px', borderBottom: '1px solid #f3f4f6' }}><span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>query</span></td>
                  <td style={{ padding: '10px 12px', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: '#6b7280', borderBottom: '1px solid #f3f4f6' }}>{p.value}</td>
                  <td style={{ padding: '10px 12px', fontSize: '13px', color: '#6b7280', borderBottom: '1px solid #f3f4f6' }}>{p.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Request Body */}
      {endpoint.body && (
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '16px' }}>Request Body</h3>
          <CodeBlock code={JSON.stringify(endpoint.body, null, 2)} language="json" />
        </div>
      )}
      
      {/* Sample Response */}
      <div style={{ marginBottom: '28px' }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '16px' }}>
          Sample Response
          <span style={{
            marginLeft: '12px',
            padding: '4px 10px',
            backgroundColor: endpoint.sampleResponse.status < 300 ? '#dcfce7' : '#fee2e2',
            color: endpoint.sampleResponse.status < 300 ? '#166534' : '#dc2626',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            {endpoint.sampleResponse.status}
          </span>
        </h3>
        <CodeBlock code={JSON.stringify(endpoint.sampleResponse.body, null, 2)} language="json" />
      </div>
      
      {/* Code Snippets */}
      <div>
        <h3 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '16px' }}>Code Snippets</h3>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          {['curl', 'javascript', 'python'].map(lang => (
            <button
              key={lang}
              onClick={() => setActiveSnippet(lang)}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: activeSnippet === lang ? '#166534' : '#f3f4f6',
                color: activeSnippet === lang ? '#fff' : '#374151',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {lang}
            </button>
          ))}
        </div>
        <CodeBlock code={snippets[activeSnippet]} language={activeSnippet} />
      </div>
    </div>
  );
};

// API Playground
const Playground = ({ apiKey, setApiKey, collection }) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);
  const [requestBody, setRequestBody] = useState('');
  const [pathParams, setPathParams] = useState({});
  const [queryParams, setQueryParams] = useState({});
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (selectedEndpoint) {
      setRequestBody(selectedEndpoint.body ? JSON.stringify(selectedEndpoint.body, null, 2) : '');
      const pp = {};
      selectedEndpoint.pathParams?.forEach(p => { pp[p.key] = p.value; });
      setPathParams(pp);
      const qp = {};
      selectedEndpoint.queryParams?.forEach(p => { qp[p.key] = p.value; });
      setQueryParams(qp);
      setResponse(null);
    }
  }, [selectedEndpoint]);
  
  const executeRequest = async () => {
    setLoading(true);
    // Simulate API call (since we can't actually call the real API)
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Return mock response
    setResponse({
      status: selectedEndpoint.sampleResponse.status,
      statusText: selectedEndpoint.sampleResponse.status === 200 ? 'OK' : 'Created',
      headers: {
        'content-type': 'application/json',
        'x-request-id': 'req_' + Math.random().toString(36).substr(2, 9)
      },
      body: selectedEndpoint.sampleResponse.body,
      time: Math.floor(Math.random() * 200) + 100
    });
    setLoading(false);
  };
  
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      {/* Request Panel */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        border: '1px solid #e5e7eb',
        padding: '24px',
        overflow: 'auto',
        maxHeight: 'calc(100vh - 200px)'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#166534', fontSize: '20px' }}>🧪 Request Builder</h2>
        
        {/* API Key Input */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
            🔐 API Key
          </label>
          <input
            type="text"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="Enter your API key..."
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: "'JetBrains Mono', monospace",
              boxSizing: 'border-box'
            }}
          />
        </div>
        
        {/* Endpoint Selector */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
            Endpoint
          </label>
          <select
            value={selectedEndpoint?.id || ''}
            onChange={e => setSelectedEndpoint(collection.endpoints.find(ep => ep.id === e.target.value))}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: '#fff',
              cursor: 'pointer'
            }}
          >
            <option value="">Select an endpoint...</option>
            {collection.endpoints.map(ep => (
              <option key={ep.id} value={ep.id}>
                {ep.method} {ep.path} — {ep.name}
              </option>
            ))}
          </select>
        </div>
        
        {selectedEndpoint && (
          <>
            {/* Path Params */}
            {selectedEndpoint.pathParams && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  Path Parameters
                </label>
                {selectedEndpoint.pathParams.map(p => (
                  <div key={p.key} style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{p.key}</div>
                    <input
                      type="text"
                      value={pathParams[p.key] || ''}
                      onChange={e => setPathParams({ ...pathParams, [p.key]: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontFamily: "'JetBrains Mono', monospace",
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
            
            {/* Query Params */}
            {selectedEndpoint.queryParams && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  Query Parameters
                </label>
                {selectedEndpoint.queryParams.map(p => (
                  <div key={p.key} style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{p.key}</div>
                    <input
                      type="text"
                      value={queryParams[p.key] || ''}
                      onChange={e => setQueryParams({ ...queryParams, [p.key]: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontFamily: "'JetBrains Mono', monospace",
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
            
            {/* Request Body */}
            {selectedEndpoint.body && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  Request Body (JSON)
                </label>
                <textarea
                  value={requestBody}
                  onChange={e => setRequestBody(e.target.value)}
                  style={{
                    width: '100%',
                    height: '200px',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontFamily: "'JetBrains Mono', monospace",
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            )}
            
            <button
              onClick={executeRequest}
              disabled={loading || (selectedEndpoint.requiresAuth && !apiKey)}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: loading ? '#9ca3af' : '#166534',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: loading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {loading ? '⏳ Sending...' : '🚀 Send Request'}
            </button>
            
            {selectedEndpoint.requiresAuth && !apiKey && (
              <p style={{ marginTop: '12px', color: '#dc2626', fontSize: '13px', textAlign: 'center' }}>
                ⚠️ This endpoint requires an API key
              </p>
            )}
          </>
        )}
      </div>
      
      {/* Response Panel */}
      <div style={{
        backgroundColor: '#1a1f2e',
        borderRadius: '16px',
        padding: '24px',
        overflow: 'auto',
        maxHeight: 'calc(100vh - 200px)'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#fff', fontSize: '20px' }}>📨 Response</h2>
        
        {response ? (
          <>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
              <span style={{
                padding: '6px 12px',
                backgroundColor: response.status < 300 ? '#166534' : '#dc2626',
                color: '#fff',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '700'
              }}>
                {response.status} {response.statusText}
              </span>
              <span style={{ color: '#9ca3af', fontSize: '13px' }}>
                ⏱️ {response.time}ms
              </span>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Headers
              </div>
              <pre style={{
                margin: 0,
                padding: '12px',
                backgroundColor: '#252b3d',
                borderRadius: '8px',
                color: '#e2e8f0',
                fontSize: '12px',
                fontFamily: "'JetBrains Mono', monospace",
                overflow: 'auto'
              }}>
                {Object.entries(response.headers).map(([k, v]) => `${k}: ${v}`).join('\n')}
              </pre>
            </div>
            
            <div>
              <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Body
              </div>
              <pre style={{
                margin: 0,
                padding: '16px',
                backgroundColor: '#252b3d',
                borderRadius: '8px',
                color: '#e2e8f0',
                fontSize: '13px',
                fontFamily: "'JetBrains Mono', monospace",
                overflow: 'auto',
                lineHeight: '1.6'
              }}>
                {JSON.stringify(response.body, null, 2)}
              </pre>
            </div>
          </>
        ) : (
          <div style={{
            height: '300px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6b7280'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📭</div>
            <p style={{ fontSize: '14px' }}>Send a request to see the response</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Request API Key Form
const RequestKeyForm = ({ onSubmit }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    useCase: ''
  });
  const [submitted, setSubmitted] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    setSubmitted(true);
  };
  
  if (submitted) {
    return (
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        textAlign: 'center',
        padding: '60px 40px',
        backgroundColor: '#f0fdf4',
        borderRadius: '24px',
        border: '1px solid #bbf7d0'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
        <h2 style={{ margin: '0 0 12px 0', color: '#166534', fontSize: '28px' }}>Request Submitted!</h2>
        <p style={{ color: '#6b7280', fontSize: '16px', lineHeight: '1.6' }}>
          We've received your API key request. Our team will review it and get back to you at <strong>{form.email}</strong> within 1-2 business days.
        </p>
        <button
          onClick={() => { setSubmitted(false); setForm({ name: '', email: '', company: '', useCase: '' }); }}
          style={{
            marginTop: '24px',
            padding: '12px 24px',
            backgroundColor: '#166534',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Submit Another Request
        </button>
      </div>
    );
  }
  
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '20px',
        border: '1px solid #e5e7eb',
        padding: '40px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
      }}>
        <h2 style={{ margin: '0 0 8px 0', color: '#166534', fontSize: '28px' }}>🔑 Request API Key</h2>
        <p style={{ color: '#6b7280', fontSize: '15px', marginBottom: '28px' }}>
          Fill out the form below and we'll send you an API key to start building.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Full Name *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Jane Smith"
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '10px',
                fontSize: '15px',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Email Address *
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="jane@company.com"
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '10px',
                fontSize: '15px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Company / Organization *
            </label>
            <input
              type="text"
              required
              value={form.company}
              onChange={e => setForm({ ...form, company: e.target.value })}
              placeholder="Acme Corp"
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '10px',
                fontSize: '15px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Use Case Description *
            </label>
            <textarea
              required
              value={form.useCase}
              onChange={e => setForm({ ...form, useCase: e.target.value })}
              placeholder="Describe what you're building and how you plan to use the API..."
              rows={4}
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '10px',
                fontSize: '15px',
                resize: 'vertical',
                boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
            />
          </div>
          
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: '#166534',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            Submit Request →
          </button>
        </form>
      </div>
    </div>
  );
};

// Dashboard
const Dashboard = ({ requests, onApprove }) => {
  const [email, setEmail] = useState('');
  const userRequests = requests.filter(r => r.email.toLowerCase() === email.toLowerCase());
  
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '20px',
        border: '1px solid #e5e7eb',
        padding: '40px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
      }}>
        <h2 style={{ margin: '0 0 8px 0', color: '#166534', fontSize: '28px' }}>📊 My Dashboard</h2>
        <p style={{ color: '#6b7280', fontSize: '15px', marginBottom: '28px' }}>
          Track your API key requests and manage your keys.
        </p>
        
        <div style={{ marginBottom: '28px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
            Enter your email to view your requests
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="jane@company.com"
            style={{
              width: '100%',
              padding: '14px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '10px',
              fontSize: '15px',
              boxSizing: 'border-box'
            }}
          />
        </div>
        
        {email && (
          <div>
            <h3 style={{ margin: '0 0 16px 0', color: '#374151', fontSize: '18px' }}>
              Your Requests ({userRequests.length})
            </h3>
            
            {userRequests.length === 0 ? (
              <div style={{
                padding: '40px',
                backgroundColor: '#f9fafb',
                borderRadius: '12px',
                textAlign: 'center',
                color: '#6b7280'
              }}>
                <p>No requests found for this email.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {userRequests.map((req, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '20px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>{req.company}</div>
                        <div style={{ fontSize: '13px', color: '#6b7280' }}>Submitted: {new Date(req.submittedAt).toLocaleDateString()}</div>
                      </div>
                      <span style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: '600',
                        backgroundColor: req.status === 'approved' ? '#dcfce7' : '#fef3c7',
                        color: req.status === 'approved' ? '#166534' : '#92400e'
                      }}>
                        {req.status === 'approved' ? '✅ Approved' : '⏳ Pending'}
                      </span>
                    </div>
                    
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
                      <strong>Use case:</strong> {req.useCase}
                    </div>
                    
                    {req.status === 'approved' && req.apiKey && (
                      <div style={{
                        padding: '12px 16px',
                        backgroundColor: '#166534',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <code style={{ color: '#fff', fontFamily: "'JetBrains Mono', monospace", fontSize: '14px' }}>
                          {req.apiKey}
                        </code>
                        <button
                          onClick={() => navigator.clipboard.writeText(req.apiKey)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            borderRadius: '6px',
                            color: '#fff',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Copy
                        </button>
                      </div>
                    )}
                    
                    {/* Admin approve button (for demo) */}
                    {req.status === 'pending' && (
                      <button
                        onClick={() => onApprove(req.id)}
                        style={{
                          marginTop: '12px',
                          padding: '10px 20px',
                          backgroundColor: '#166534',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        🔧 Approve (Admin Demo)
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// MAIN APP
// ============================================

export default function LawnCareDevPortal({ apiCollection = API_COLLECTION, brandName, brandIcon }) {
  const collection = apiCollection;
  const displayName = brandName || collection.info.name;
  const displayIcon = brandIcon || '🌿';

  const [activeTab, setActiveTab] = useState('home');
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [requests, setRequests] = useState([]);
  
  const handleKeyRequest = (form) => {
    const newRequest = {
      id: Date.now().toString(),
      ...form,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      apiKey: null
    };
    const updated = [...requests, newRequest];
    setRequests(updated);
    // In production: send email notification here
    console.log('📧 Email would be sent to admin with:', newRequest);
  };
  
  const handleApprove = (requestId) => {
    const updated = requests.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'approved',
          apiKey: 'sk_live_' + Math.random().toString(36).substr(2, 24)
        };
      }
      return r;
    });
    setRequests(updated);
  };
  
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#fafdf7',
      backgroundImage: `
        radial-gradient(ellipse at top, rgba(34, 197, 94, 0.08) 0%, transparent 50%),
        radial-gradient(ellipse at bottom right, rgba(22, 101, 52, 0.05) 0%, transparent 50%)
      `,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      {/* Header */}
      <header style={{
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '32px' }}>{displayIcon}</span>
          <span style={{ fontSize: '20px', fontWeight: '700', color: '#166534' }}>
            {displayName}
          </span>
        </div>
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </header>
      
      {/* Main Content */}
      <main style={{ padding: '20px 40px 60px', maxWidth: '1400px', margin: '0 auto' }}>
        {activeTab === 'home' && <HomePage setActiveTab={setActiveTab} collection={collection} />}
        {activeTab === 'explorer' && (
          <APIExplorer
            onSelectEndpoint={setSelectedEndpoint}
            selectedEndpoint={selectedEndpoint}
            apiKey={apiKey}
            collection={collection}
          />
        )}
        {activeTab === 'playground' && (
          <Playground apiKey={apiKey} setApiKey={setApiKey} collection={collection} />
        )}
        {activeTab === 'request-key' && (
          <RequestKeyForm onSubmit={handleKeyRequest} />
        )}
        {activeTab === 'dashboard' && (
          <Dashboard requests={requests} onApprove={handleApprove} />
        )}
      </main>
      
      {/* Footer */}
      <footer style={{
        padding: '24px 40px',
        borderTop: '1px solid #e5e7eb',
        textAlign: 'center',
        color: '#6b7280',
        fontSize: '14px'
      }}>
        <p style={{ margin: 0 }}>
          {displayIcon} {displayName} • Documentation Portal
        </p>
      </footer>
    </div>
  );
}
