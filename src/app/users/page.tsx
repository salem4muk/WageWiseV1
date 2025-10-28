
import UserManagement from '@/components/users/UserManagement';
import { AuthProvider } from '@/contexts/AuthContext';
import { UsersProvider } from '@/contexts/UsersContext';

export default function UsersPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <UserManagement />
    </div>
  );
}
