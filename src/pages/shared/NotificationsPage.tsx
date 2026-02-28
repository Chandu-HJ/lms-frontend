import { useState } from 'react';
import { useNotifications } from '../../context/NotificationsContext';
import './NotificationsPage.css';

interface NotificationsPageProps {
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
}

const formatDateTime = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const NotificationsPage = ({ role }: NotificationsPageProps) => {
  const [markingAll, setMarkingAll] = useState(false);
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();

  const handleMarkAll = async () => {
    if (markingAll || unreadCount === 0) return;
    setMarkingAll(true);
    try {
      await markAllAsRead();
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <section className="notificationsPage">
      <div className="notificationsHeader">
        <h2>
          {role === 'STUDENT'
            ? 'Student Notifications'
            : role === 'INSTRUCTOR'
            ? 'Instructor Notifications'
            : 'Admin Notifications'}
        </h2>
        <div className="notificationsHeaderActions">
          <p>Unread: {unreadCount}</p>
          <button
            type="button"
            className="notificationsMarkAllBtn"
            disabled={loading || markingAll || unreadCount === 0}
            onClick={() => void handleMarkAll()}
          >
            {markingAll ? 'Marking...' : 'Mark all as read'}
          </button>
        </div>
      </div>

      {loading ? <p className="notificationsEmpty">Loading notifications...</p> : null}

      {!loading && notifications.length === 0 ? (
        <p className="notificationsEmpty">No notifications available.</p>
      ) : null}

      <div className="notificationsList">
        {notifications.map((item) => (
          <article
            key={item.id}
            className={`notificationCard ${item.read ? 'notificationRead' : 'notificationUnread'}`}
          >
            <div className="notificationCardTop">
              <h3>{item.message}</h3>
              <span>{item.eventType}</span>
            </div>
            <p>{formatDateTime(item.createdAt)}</p>
            {!item.read ? (
              <button type="button" onClick={() => void markAsRead(item.id)}>
                Mark as read
              </button>
            ) : (
              <p className="notificationReadLabel">Read</p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};

export default NotificationsPage;
