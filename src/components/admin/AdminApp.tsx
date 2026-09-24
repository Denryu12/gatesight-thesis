import { useState } from 'react';
import { useStore } from '../../store/StoreContext';
import { AdminLogin } from './AdminLogin';
import { AdminShell } from './AdminShell';

export function AdminApp() {
  const { state } = useStore();

  if (!state.adminSession) {
    return <AdminLogin />;
  }

  return <AdminShell />;
}
