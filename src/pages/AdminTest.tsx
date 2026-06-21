// Simple test page to verify admin routing works
export default function AdminTest() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      flexDirection: 'column',
      backgroundColor: '#f0f0f0',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#0d9488' }}>
        ✅ Admin Route Works!
      </h1>
      <p style={{ color: '#666' }}>
        If you see this page, HashRouter is working correctly.
      </p>
      <p style={{ marginTop: '1rem', color: '#333' }}>
        Current URL hash: <code style={{ background: '#ddd', padding: '0.25rem 0.5rem' }}>{typeof window !== 'undefined' ? window.location.hash : 'N/A'}</code>
      </p>
      <div style={{ marginTop: '2rem' }}>
        <a href="#/admin/login" style={{ color: '#0d9488', marginRight: '1rem' }}>Go to Login</a>
        <a href="#/" style={{ color: '#0d9488' }}>Go to Home</a>
      </div>
    </div>
  );
}
