import type { AppProps } from 'next/app';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default MyApp; 