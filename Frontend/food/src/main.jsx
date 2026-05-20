import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import store from './store/store.js'
import './index.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'
import ThemeSync from './components/ThemeSync.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* StrictMode re-runs some effects in dev to surface bugs; API caching helps avoid duplicate calls. */}
    <Provider store={store}>
      <BrowserRouter>
        {/* Keeps Bootstrap theme in sync with Redux before routes render. */}
        <ThemeSync />
        <App/>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
