import { useEffect, useMemo, useState } from 'react';
import { getAdminUsersByRole, getAdminUsersByStatus, updateAdminUserStatus } from '../../api/admin.service';
import { type AdminUser, type UserAccountStatus } from '../../interfaces/admin.types';
import { resolveImageSrc } from '../../utils/media';
import './AdminUsers.css';

const baseStatusOptions: UserAccountStatus[] = ['ACTIVE', 'DEACTIVE'];

const AdminUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'DEACTIVE'>('ACTIVE');
  const [roleFilter, setRoleFilter] = useState<'ALL' | AdminUser['role']>('ALL');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        if (roleFilter === 'ALL') {
          const data = await getAdminUsersByStatus(statusFilter);
          setUsers(data.filter((user) => user.status !== 'PENDING'));
        } else {
          const data = await getAdminUsersByRole(roleFilter);
          setUsers(data.filter((user) => user.status === statusFilter));
        }
      } catch (error) {
        console.error('Unable to fetch users', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    void loadUsers();
  }, [roleFilter, statusFilter]);

  const filteredUsers = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return users;

    return users.filter((user) =>
      user.firstName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query) ||
      user.status.toLowerCase().includes(query)
    );
  }, [users, searchText]);

  const handleStatusChange = async (userId: number, status: UserAccountStatus) => {
    setUpdatingUserId(userId);
    try {
      await updateAdminUserStatus(userId, status);
      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, status } : user)));
    } catch (error) {
      console.error('Unable to update user status', error);
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <section className="adminCard">
      <h2>Users</h2>
      <div className="adminUserFilters">
        <input
          type="text"
          className="adminUserSearch"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Search by name, email, role, status"
        />
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'ACTIVE' | 'DEACTIVE')}>
          <option value="ACTIVE">ACTIVE</option>
          <option value="DEACTIVE">DEACTIVE</option>
        </select>
        <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as 'ALL' | AdminUser['role'])}>
          <option value="ALL">All Roles</option>
          <option value="STUDENT">STUDENT</option>
          <option value="INSTRUCTOR">INSTRUCTOR</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </div>
      {loading ? <p className="adminMuted">Loading users...</p> : null}
      {!loading && filteredUsers.length === 0 ? <p className="adminMuted">No users found.</p> : null}
      {!loading && filteredUsers.length > 0 ? (
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
              {filteredUsers.map((user) => (
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
                      {baseStatusOptions.map((status) => (
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

export default AdminUsers;
