import { useEffect, useState, type FormEvent } from 'react';
import { userApi } from '../../api/user.api';
import { AppLayout } from '../../components/layout/AppLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { parseApiError } from '../../context/AuthContext';
import type { UserStatus } from '../../types/auth.types';
import type { UserSummary } from '../../types/user.types';

export const AdminDashboardPage = () => {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [selectedEmail, setSelectedEmail] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<UserStatus>('ACTIVE');
  const [newCategory, setNewCategory] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadUsers = async (): Promise<void> => {
    try {
      const allUsers = await userApi.getAllUsers();
      setUsers(allUsers);
      if (allUsers.length > 0 && selectedEmail.length === 0) {
        setSelectedEmail(allUsers[0].email);
      }
    } catch (err) {
      setError(parseApiError(err).message);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const handleStatusUpdate = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      await userApi.updateUserStatus({ email: selectedEmail, status: selectedStatus });
      setMessage('User status updated.');
      await loadUsers();
    } catch (err) {
      setError(parseApiError(err).message);
    }
  };

  const handleAddCategory = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      await userApi.addCategory({ name: newCategory });
      setMessage('Category added.');
      setNewCategory('');
    } catch (err) {
      setError(parseApiError(err).message);
    }
  };

  return (
    <AppLayout title="Admin Dashboard">
      <div className="grid-2">
        <section className="card">
          <h3>All Users</h3>
          <ul className="user-list">
            {users.map((user) => (
              <li key={user.id}>
                <strong>{user.firstName}</strong> ({user.email}) - {user.role} / {user.status}
              </li>
            ))}
          </ul>
        </section>

        <div className="stack">
          <form className="card" onSubmit={handleStatusUpdate}>
            <h3>Update User Status</h3>
            <Select
              label="User"
              value={selectedEmail}
              onChange={(event) => setSelectedEmail(event.target.value)}
              options={users.map((user) => ({ label: `${user.firstName} (${user.email})`, value: user.email }))}
            />
            <Select
              label="Status"
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value as UserStatus)}
              options={[
                { label: 'Active', value: 'ACTIVE' },
                { label: 'Deactive', value: 'DEACTIVE' },
              ]}
            />
            <Button type="submit" disabled={selectedEmail.length === 0}>
              Update Status
            </Button>
          </form>

          <form className="card" onSubmit={handleAddCategory}>
            <h3>Add Category</h3>
            <Input
              label="Category Name"
              value={newCategory}
              onChange={(event) => setNewCategory(event.target.value)}
              required
            />
            <Button type="submit">Add Category</Button>
          </form>

          {message ? <p className="field-success">{message}</p> : null}
          {error ? <p className="field-error">{error}</p> : null}
        </div>
      </div>
    </AppLayout>
  );
};
