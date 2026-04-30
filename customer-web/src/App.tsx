import { BrowserRouter } from 'react-router-dom';
import AuthProvider from '@/components/AuthProvider';
import { ErrorBoundary, ToastContainer } from '@/components';
import AppRoutes from '@/routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <AppRoutes />
          <ToastContainer />
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
