import { notFound } from 'next/navigation';
import { isLabUiEnabled } from '../../lib/lab-flags';

export default function DevLayout({ children }: { children: React.ReactNode }) {
  if (!isLabUiEnabled()) {
    notFound();
  }
  return children;
}
