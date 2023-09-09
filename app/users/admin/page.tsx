'use client'
import ManageUsers from './_components/ManageUsers';
import ManageList from './_components/ManageLists';

// Admin pannel
export default function Admin() {
  return (
    <>
      <ManageUsers />
      <ManageList />
    </>
  );
}
