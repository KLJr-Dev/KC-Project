import { notFound, redirect } from 'next/navigation';
import { isLabUiEnabled } from '../../lib/lab-flags';

export default function UsersRedirect() {
  if (!isLabUiEnabled()) {
    notFound();
  }
  redirect('/dev/users');
}
