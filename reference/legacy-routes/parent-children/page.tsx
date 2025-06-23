'use client';

import { useEffect } from 'react';
import { redirect } from 'next/navigation';

export default function ParentChildrenRedirect() {
  useEffect(() => {
    redirect('/dashboard/parent/children');
  }, []);
  
  return null;
}