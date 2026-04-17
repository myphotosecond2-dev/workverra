export const getNotifications = async (req, res) => {
  try {
    res.json({ success: true, notifications: [], message: "No notifications yet" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAllRead = async (req, res) => {
  try {
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
