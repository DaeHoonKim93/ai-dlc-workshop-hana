import { BrowserRouter } from 'react-router-dom';
import AuthProvider from '@/components/AuthProvider';
import { ToastContainer } from '@/components';
import AppRoutes from '@/routes/AppRoutes';

function App() {
  return (
    <BrowserRouter basename="/admin">
      <AuthProvider>
        <AppRoutes />
        <ToastContainer />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
