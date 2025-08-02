import React from 'react'

const TestComponent = () => {
  return (
    <div style={{
      padding: '20px',
      backgroundColor: 'blue',
      color: 'white',
      fontSize: '18px',
      borderRadius: '8px',
      margin: '20px',
      textAlign: 'center'
    }}>
      <h1>🧪 Test Component Working!</h1>
      <p>If you can see this, React is rendering correctly.</p>
      <p>Timestamp: {new Date().toISOString()}</p>
    </div>
  )
}

export default TestComponent 