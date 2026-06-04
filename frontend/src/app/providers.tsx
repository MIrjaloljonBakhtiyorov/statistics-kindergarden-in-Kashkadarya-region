import { PropsWithChildren } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/shared/theme/theme';

import '../lib/i18n';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <BrowserRouter>{children}</BrowserRouter>
    </ThemeProvider>
  );
}
