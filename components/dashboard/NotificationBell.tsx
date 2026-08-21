"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type NotificationType = "info" | "success" | "warning" | "error";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link?: string;
  createdAt: string;
}

function timeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch("/api/notifications", { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      try {
        await fetch(`/api/notifications/${notification.id}`, { method: "PATCH" });
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error(err);
      }
    }
    if (notification.link) {
      setIsOpen(false);
      router.push(notification.link);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await fetch(`/api/notifications/${id}`, { method: "DELETE" });
      setNotifications((prev) => {
        const item = prev.find((n) => n.id === id);
        if (item && !item.read) {
          setUnreadCount((c) => Math.max(0, c - 1));
        }
        return prev.filter((n) => n.id !== id);
      });
    } catch (err) {
      console.error(err);
    }
  };

  const getTypeColor = (type: NotificationType) => {
    switch (type) {
      case "info": return "#3b82f6";
      case "success": return "#22c55e";
      case "warning": return "#f59e0b";
      case "error": return "#ef4444";
      default: return "#3b82f6";
    }
  };

  return (
    <div className="notification-container" ref={dropdownRef}>
      <button 
        className="dash-iconbtn notification-btn" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button className="mark-read-btn" onClick={handleMarkAllRead}>
                Mark all read
              </button>
            )}
          </div>
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">No notifications yet</div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`notification-item ${!n.read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(n)}
                >
                  <div className="notification-item-content">
                    <div className="notification-title-row">
                      <div className="notification-title">
                        <span 
                          className="notification-type-dot" 
                          style={{ backgroundColor: getTypeColor(n.type) }} 
                        />
                        {n.title}
                      </div>
                      <span className="notification-time">{timeAgo(n.createdAt)}</span>
                    </div>
                    <div className="notification-message">{n.message}</div>
                  </div>
                  <button 
                    className="notification-delete" 
                    onClick={(e) => handleDelete(e, n.id)}
                    aria-label="Delete notification"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <style>{`
        .notification-container {
          position: relative;
          display: inline-block;
        }
        .notification-btn {
          position: relative;
        }
        .notification-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          background: #ef4444;
          color: white;
          font-size: 9px;
          font-weight: bold;
          height: 14px;
          min-width: 14px;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 3px;
          line-height: 1;
        }
        .notification-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 320px;
          background-color: var(--dash-card-bg);
          border: 1px solid var(--dash-card-border);
          border-radius: 14px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          overflow: hidden;
          z-index: 100;
          animation: dropFade 0.2s ease-out;
        }
        @keyframes dropFade {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--dash-card-border);
        }
        .notification-header h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: var(--dash-ink);
        }
        .mark-read-btn {
          background: none;
          border: none;
          color: var(--color-primary);
          font-size: 12px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: background 0.2s;
        }
        .mark-read-btn:hover {
          background: rgba(255,255,255,0.05);
        }
        .notification-list {
          max-height: 400px;
          overflow-y: auto;
        }
        .notification-empty {
          padding: 32px 16px;
          text-align: center;
          color: var(--dash-ink-muted);
          font-size: 14px;
        }
        .notification-item {
          display: flex;
          align-items: flex-start;
          padding: 12px 16px;
          border-bottom: 1px solid var(--dash-card-border);
          cursor: pointer;
          transition: background 0.2s;
        }
        .notification-item:last-child {
          border-bottom: none;
        }
        .notification-item:hover {
          background: rgba(255,255,255,0.03);
        }
        .notification-item.unread {
          background: rgba(255,255,255,0.015);
        }
        .notification-item.unread:hover {
          background: rgba(255,255,255,0.04);
        }
        .notification-item-content {
          flex: 1;
          min-width: 0;
          margin-right: 8px;
        }
        .notification-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }
        .notification-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--dash-ink);
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .notification-type-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .notification-time {
          font-size: 11px;
          color: var(--dash-ink-muted);
          white-space: nowrap;
        }
        .notification-message {
          font-size: 13px;
          color: var(--dash-ink-dim);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .notification-delete {
          background: none;
          border: none;
          color: var(--dash-ink-muted);
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          opacity: 0;
          transition: opacity 0.2s, background 0.2s, color 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .notification-item:hover .notification-delete {
          opacity: 1;
        }
        .notification-delete:hover {
          background: rgba(255,255,255,0.05);
          color: var(--dash-ink);
        }
      `}</style>
    </div>
  );
}
