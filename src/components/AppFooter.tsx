import { useState, type ReactNode } from 'react';
import { AboutDialog } from '@/components/AboutDialog';

interface AppFooterProps {
  children: ReactNode;
}

export function AppFooter({ children }: AppFooterProps) {
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <footer className="app-footer">
      <p className="app-footer__row">
        <span>{children}</span>
        <button
          type="button"
          className="app-footer__about"
          onClick={() => setAboutOpen(true)}
        >
          About
        </button>
      </p>
      <AboutDialog open={aboutOpen} onOpenChange={setAboutOpen} />
    </footer>
  );
}
