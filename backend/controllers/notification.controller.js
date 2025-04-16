import Notification from "../models/notification.model.js";

export const getNotifcations = async (req, res) => {
    try {
        const userId = req.user._id;
        const notifications = await Notification.find({ to: userId }).populate({
            path: "from",
            select: "username profileImg"
        })

        await Notification.updateMany({ to: userId }, { Read: true });
        res.status(200).json(notifications);
    } catch (error) {
        console.log("error in getNotifcations controller", error.message)
        return res.status(500).json({ error: error.message });

    }

}

export const deleteNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        await Notification.deleteMany({ to: userId });
        res.status(200).json({ message: "Notifications deleted successfully" });
    } catch (error) {
        console.log("error in deleteNotifications controller", error.message)
        return res.status(500).json({ error: error.message });

    }
}


// Controller function to delete a single notification
// export const deleteNotification = async (req, res) => {
//     try {
//         // Get the current user's ID from the request
//         const userId = req.user._id;
//         // Get the notification ID from the request parameters
//         const notificationId = req.params.id;

//         // Find the notification by its ID
//         const notification = await Notification.findById(notificationId);
//         // If notification doesn't exist, return 404 error
//         if (!notification) {
//             return res.status(404).json({ message: "Notification not found" });
//         }

//         // Check if the notification belongs to the current user
//         // Convert IDs to strings for comparison
//         if (notification.to.toString() !== userId.toString()) {
//             return res.status(403).json({ message: "You are not authorized to delete this notification" });
//         }

//         // Delete the notification from the database
//         await Notification.findByIdAndDelete(notificationId);
//     } catch (error) {
//         // Log error and return 500 status if any error occurs
//         console.log("error in deleteNotification controller", error.message)
//         return res.status(500).json({ error: error.message });
//     }
// }