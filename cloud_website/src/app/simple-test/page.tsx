export default function SimpleTestPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#ffffff', 
      padding: '2rem',
      color: '#000000',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: 'bold', 
          color: '#1e293b',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          Anywheredoor - Simple Test Page
        </h1>
        
        <div style={{ 
          backgroundColor: '#0ea5e9', 
          color: 'white', 
          padding: '2rem', 
          borderRadius: '8px',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
            This should be clearly visible!
          </h2>
          <p style={{ fontSize: '1.2rem' }}>
            If you can see this blue box with white text, the basic styling is working.
          </p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <div style={{ 
            backgroundColor: '#14b8a6', 
            color: 'white', 
            padding: '1.5rem', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Teal Box</h3>
            <p>This is the accent color</p>
          </div>
          
          <div style={{ 
            backgroundColor: '#1e293b', 
            color: 'white', 
            padding: '1.5rem', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Navy Box</h3>
            <p>This is the navy color</p>
          </div>
        </div>
        
        <div style={{ 
          border: '2px solid #0ea5e9', 
          padding: '2rem', 
          borderRadius: '8px',
          backgroundColor: '#f8fafc'
        }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1e293b' }}>
            Navigation Test
          </h3>
          <nav style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
            <a href="/" style={{ 
              color: '#0ea5e9', 
              textDecoration: 'none', 
              fontSize: '1.1rem',
              fontWeight: '500',
              padding: '0.5rem 1rem',
              border: '1px solid #0ea5e9',
              borderRadius: '4px'
            }}>
              Home
            </a>
            <a href="/courses" style={{ 
              color: '#0ea5e9', 
              textDecoration: 'none', 
              fontSize: '1.1rem',
              fontWeight: '500',
              padding: '0.5rem 1rem',
              border: '1px solid #0ea5e9',
              borderRadius: '4px'
            }}>
              Courses
            </a>
            <a href="/about" style={{ 
              color: '#0ea5e9', 
              textDecoration: 'none', 
              fontSize: '1.1rem',
              fontWeight: '500',
              padding: '0.5rem 1rem',
              border: '1px solid #0ea5e9',
              borderRadius: '4px'
            }}>
              About
            </a>
            <a href="/contact" style={{ 
              color: '#0ea5e9', 
              textDecoration: 'none', 
              fontSize: '1.1rem',
              fontWeight: '500',
              padding: '0.5rem 1rem',
              border: '1px solid #0ea5e9',
              borderRadius: '4px'
            }}>
              Contact
            </a>
          </nav>
        </div>
        
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <p style={{ fontSize: '1rem', color: '#6b7280' }}>
            If you can see all the content above clearly, the styling system is working properly.
            The issue might be with specific components or dynamic content loading.
          </p>
        </div>
      </div>
    </div>
  );
}