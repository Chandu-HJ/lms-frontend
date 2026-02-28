import { useEffect, useState } from 'react';
import { getAdminUsersByStatus, updateAdminUserStatus } from '../../api/admin.service';
import { type AdminUser, type UserAccountStatus } from '../../interfaces/admin.types';
import { resolveImageSrc } from '../../utils/media';
import './AdminUsers.css';

const pendingStatusOptions: UserAccountStatus[] = ['ACTIVE', 'DEACTIVE'];

const AdminPendingUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const data = await getAdminUsersByStatus('PENDING');
        setUsers(data);
      } catch (error) {
        console.error('Unable to fetch pending users', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    void loadUsers();
  }, []);

  const handleStatusChange = async (userId: number, status: UserAccountStatus) => {
    setUpdatingUserId(userId);
    try {
      await updateAdminUserStatus(userId, status);
      setUsers((prev) => prev.filter((user) => user.id !== userId));
    } catch (error) {
      console.error('Unable to update user status', error);
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <section className="adminCard">
      <h2>Pending Users</h2>
      {loading ? <p className="adminMuted">Loading users...</p> : null}
      {!loading && users.length === 0 ? <p className="adminMuted">No pending users found.</p> : null}
      {!loading && users.length > 0 ? (
        <div className="adminTableWrap">
          <table className="adminTable">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="adminUserCell">
                      <img src={resolveImageSrc(user.avatarUrl)} alt={user.firstName} />
                      <span>{user.firstName}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <select
                      value={user.status}
                      disabled={updatingUserId === user.id}
                      onChange={(event) =>
                        void handleStatusChange(user.id, event.target.value as UserAccountStatus)
                      }
                    >
                      <option value="PENDING">PENDING</option>
                      {pendingStatusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
};

export default AdminPendingUsers;
