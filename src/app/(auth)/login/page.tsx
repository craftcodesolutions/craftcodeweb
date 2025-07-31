import { Suspense } from 'react';
import Login from './Login';
import { LoginSkeleton } from './LoginSkeleton';

export default function Page() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <Login />
    </Suspense>
  );
}
