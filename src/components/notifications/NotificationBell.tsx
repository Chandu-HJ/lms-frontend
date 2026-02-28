import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationsContext';
import { type NotificationItem } from '../../interfaces/notification.types';
import './NotificationBell.css';

interface NotificationBellProps {
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
}

const formatDateTime = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const NotificationBell = ({ role }: NotificationBellProps) => {
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();

  const notificationsPath = useMemo(
    () =>
      role === 'STUDENT'
        ? '/student/notifications'
        : role === 'INSTRUCTOR'
        ? '/instructor/notifications'
        : '/admin/notifications',
    [role]
  );

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (event.target instanceof Node && !rootRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleItemClick = async (item: NotificationItem) => {
    if (!item.read) {
      await markAsRead(item.id);
    }
  };

  const handleMarkAll = async () => {
    if (markingAll || unreadCount === 0) return;
    setMarkingAll(true);
    try {
      await markAllAsRead();
    } finally {
      setMarkingAll(false);
    }
  };

  const visibleItems = notifications.slice(0, 6);
  const badgeText = unreadCount > 99 ? '99+' : String(unreadCount);

  return (
    <div className="notifRoot" ref={rootRef}>
      <button
        type="button"
        className="notifBellButton"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open notifications"
      >
        <span className="notifBellIcon" aria-hidden>
          🔔
        </span>
        {unreadCount > 0 && <span className="notifBadge">{badgeText}</span>}
      </button>

      {isOpen && (
        <div className="notifPanel" role="dialog" aria-label="Notifications">
          <div className="notifPanelHeader">
            <h3>Notifications</h3>
            <button
              type="button"
              className="notifSeeAll"
              onClick={() => {
                setIsOpen(false);
                navigate(notificationsPath);
              }}
            >
              See all
            </button>
          </div>

          <div className="notifPanelActions">
            <button
              type="button"
              className="notifMarkAllBtn"
              disabled={loading || markingAll || unreadCount === 0}
              onClick={() => void handleMarkAll()}
            >
              {markingAll ? 'Marking...' : 'Mark all as read'}
            </button>
          </div>

          <div className="notifPanelBody">
            {loading ? <p className="notifHint">Loading...</p> : null}
            {!loading && visibleItems.length === 0 ? <p className="notifHint">No notifications</p> : null}
            {!loading &&
              visibleItems.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={`notifItem ${item.read ? 'notifItemRead' : 'notifItemUnread'}`}
                  onClick={() => void handleItemClick(item)}
                >
                  <span className="notifItemMessage">{item.message}</span>
                  <span className="notifItemTime">{formatDateTime(item.createdAt)}</span>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
