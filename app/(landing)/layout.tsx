import Navbar from '@/components/common/navbar';
import { ThemeProvider } from '@/components/providers/theme-provider';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      forcedTheme="light"
      attribute="class"
      disableTransitionOnChange
    >
      <Navbar />
      {children}
    </ThemeProvider>
  );
}
