import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

console.log('main.jsx loaded, starting React app...')

// Add error boundary
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error)
  document.body.innerHTML = `<div style="padding: 20px; background: red; color: white;">Global Error: ${event.error.message}</div>`
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
  document.body.innerHTML = `<div style="padding: 20px; background: orange; color: white;">Promise Error: ${event.reason}</div>`
})

try {
  const root = ReactDOM.createRoot(document.getElementById('root'))
  root.render(
    <BrowserRouter>
      <App />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </BrowserRouter>
  )
  console.log('React app rendered successfully')
} catch (error) {
  console.error('Error rendering React app:', error)
  document.body.innerHTML = `<div style="padding: 20px; background: red; color: white;">React Error: ${error.message}</div>`
} 