'use client'
import { useState, useContext, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, UserContext } from '_components/UserProvider'
import * as fetchService from '_lib/client/fetchService';
import ManageUsers from './_components/ManageUsers';
import ManageList from './_components/ManageLists';
import { alertService } from '_components/Alerts';

// Admin pannel
export default function Admin() {
  const [ users, setUsers ] = useState<Array<User>>([]);
  const { user } = useContext(UserContext)!;
  const router = useRouter();

  // Refresh page on user list change
  const updateUsers = useCallback(() => {
    if (user.isAdmin == false) {
      router.push('/401');
    }
    fetchService.post('/api/users/list')
      .then((data) => {
        setUsers(data);
      })
      .catch((error) => {
        if (error instanceof fetchService.FetchError && error.status == 401) {
          router.push('/401');
        } else {
          alertService.handleError(error);
        }
      });
  }, [router, user]);

  useEffect(() => {
    updateUsers();
  }, [updateUsers]);

  // Page
  return (
    <>
      <ManageUsers users={users} updateUsers={updateUsers} />
      <ManageList users={users} />
    </>
  );
}
