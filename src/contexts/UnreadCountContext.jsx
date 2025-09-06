import React, { createContext, useContext, useState } from "react";

const UnreadCountContext = createContext();

export const UnreadCountProvider = ({ children }) => {
  const [unreadCounts, setUnreadCounts] = useState({});

  // Optionally, compute total unread count
  const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  return (
    <UnreadCountContext.Provider value={{ unreadCounts, setUnreadCounts, totalUnread }}>
      {children}
    </UnreadCountContext.Provider>
  );
};

export const useUnreadCount = () => useContext(UnreadCountContext);
