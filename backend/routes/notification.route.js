import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { get } from 'mongoose';
import { deleteNotifications, getNotifcations } from '../controllers/notification.controller.js';

const router = express.Router();
router.get('/', protectRoute, getNotifcations);
router.delete("/", protectRoute, deleteNotifications);
// router.delete("/:id", protectRoute, deleteNotification);


export default router;