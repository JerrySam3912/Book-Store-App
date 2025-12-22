import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import router from './routers/router.jsx'
import 'sweetalert2/dist/sweetalert2.js'

import { Provider } from 'react-redux'
import { store } from './redux/store.js'
// Import AuthProvide vào đây
import { AuthProvide } from './context/AuthContext.jsx' 
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import ErrorBoundary from './components/ErrorBoundary.jsx'

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <Provider store={store}>
      <AuthProvide>  {/* ✅ Bọc AuthProvide ở ngoài cùng */}
        <RouterProvider router={router} />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </AuthProvide>
    </Provider>
  </ErrorBoundary>
)