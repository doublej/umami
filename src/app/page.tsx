'use client';
import { useEffect } from 'react';
import { redirect } from 'next/navigation';
import { removeItem } from '@/lib/storage';
import { LAST_TEAM_CONFIG } from '@/lib/constants';

export default function RootPage() {
  useEffect(() => {
    removeItem(LAST_TEAM_CONFIG);

    redirect(`/dashboard`);
  }, []);

  return null;
}
