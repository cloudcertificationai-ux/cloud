export default function NotFound() {
  return (
    <html>
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9fafb',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            maxWidth: '28rem',
            width: '100%',
            textAlign: 'center',
            padding: '2rem'
          }}>
            <h1 style={{
              fontSize: '4rem',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '1rem'
            }}>404</h1>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '1rem'
            }}>Page Not Found</h2>
            <p style={{
              color: '#6b7280',
              marginBottom: '2rem'
            }}>
              The page you're looking for doesn't exist or has been moved.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <a
                href="/admin/dashboard"
                style={{
                  display: 'inline-block',
                  width: '100%',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  fontWeight: '500',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  transition: 'background-color 0.2s'
                }}
              >
                Go to Dashboard
              </a>
              <a
                href="/"
                style={{
                  display: 'inline-block',
                  width: '100%',
                  padding: '0.75rem 1.5rem',
                  border: '1px solid #d1d5db',
                  color: '#374151',
                  fontWeight: '500',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  backgroundColor: 'white',
                  transition: 'background-color 0.2s'
                }}
              >
                Go to Home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}