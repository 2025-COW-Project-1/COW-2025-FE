import { useEffect, useMemo, useState } from 'react';
import {
  AUTH_CHANGED_EVENT,
  getDisplayUserName,
  isLoggedIn as checkLoggedIn,
} from '../utils/auth';

export function useAuth() {
  const [loggedIn, setLoggedIn] = useState<boolean>(() => checkLoggedIn());
  const [userName, setUserName] = useState<string>(() => getDisplayUserName());

  useEffect(() => {
    const sync = () => {
      setLoggedIn(checkLoggedIn());
      setUserName(getDisplayUserName());
    };

    const onAuthChanged = () => sync();
    window.addEventListener(AUTH_CHANGED_EVENT, onAuthChanged);

    const onStorage = () => {
      sync();
    };
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, onAuthChanged);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return useMemo(
    () => ({
      isLoggedIn: loggedIn,
      userName,
    }),
    [loggedIn, userName],
  );
}
