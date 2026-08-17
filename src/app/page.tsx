'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LAST_TEAM_CONFIG } from '@/lib/constants';
import { removeItem } from '@/lib/storage';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    removeItem(LAST_TEAM_CONFIG);

    router.replace(`/overview`);
  }, [router]);

  return null;
}
