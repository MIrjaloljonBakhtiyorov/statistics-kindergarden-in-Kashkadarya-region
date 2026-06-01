import { PropsWithChildren } from 'react';
import { BrowserRouter } from 'react-router-dom';

import '../lib/i18n';

export function AppProviders({ children }: PropsWithChildren) {
  return <BrowserRouter>{children}</BrowserRouter>;
}
