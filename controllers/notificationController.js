// GET notifications
const getNotifications = async (req, res) => {
  try {
    // Dummy response for now
    res.json({
      success: true,
      notifications: [],
      message: 'No notifications yet'
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// MARK ALL AS READ
const markAllRead = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'All notifications marked as read'
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  getNotifications,
  markAllRead
}