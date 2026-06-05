'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import LoadingSpinner from './ui/loading-spinner';

type Role = 'user' | 'moderator' | 'admin';

interface RequireRoleProps {
  roles: Role[];
  children: React.ReactNode;
  fallback?: string;
}

export default function RequireRole({ roles, children, fallback = '/' }: RequireRoleProps) {
  const { isAuthenticated, role } = useAuth();
  const router = useRouter();
  const allowed = isAuthenticated && role && roles.includes(role);

  useEffect(() => {
    if (!isAuthenticated) router.replace('/auth');
    else if (!allowed) router.replace(fallback);
  }, [isAuthenticated, allowed, router, fallback]);

  if (!isAuthenticated || !allowed) {
    return (
      <div className="py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return <>{children}</>;
}
