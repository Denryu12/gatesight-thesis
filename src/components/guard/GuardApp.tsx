import { useState } from 'react';
import { useStore } from '../../store/StoreContext';
import { GuardLogin } from './GuardLogin';
import { GuardMain } from './GuardMain';

export function GuardApp() {
  const { state } = useStore();

  if (!state.guardSession) {
    return <GuardLogin />;
  }

  return <GuardMain />;
}
