import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';
import Post from '../models/post.model.js';
import { v2 as cloudinary } from 'cloudinary';
export const createPost = async (req, res) => {
    try {
        const { text } = req.body;
        let { img } = req.body;
        const userId = req.user._id.toString();
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }


        if (!text && !img) {
            return res.status(400).json({ error: "Please provide text or image" });
        }
        if (img) {
            const uploadResult = await cloudinary.uploader.upload(img)
            img = uploadResult.secure_url;
        }
        const newPost = new Post({
            user: userId,
            text,
            img,
        });
        await newPost.save();
        res.status(201).json({ newPost });


    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
        console.log("error in createPost controller", error);

    }
}

export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.Id);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });

        }
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "You are not authorized to delete this post" });
        }
        if (post.img) {
            const publicId = post.img.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        }
        await Post.findByIdAndDelete(req.params.Id);
        res.status(200).json({ message: "Post deleted successfully" });

    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
        console.log("error in deletePost controller", error);

    }
}

export const commentPost = async (req, res) => {
    try {
        const { text } = req.body;
        const postId = req.params.id;
        const userId = req.user._id;
        if (!text) {
            return res.status(400).json({ error: "text field required" });
        }
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        const comment = {
            text,
            user: userId,
        };
        post.comments.push(comment);
        await post.save();
        res.status(200).json(post);

    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
        console.log("error in commentPost controller", error);

    }
}
export const likeUnlikePost = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id: postId } = req.params;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        const userLikedPost = post.likes.includes(userId);
        if (userLikedPost) {
            await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
            await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
            // Remove the notification when user unlikes the post
            await Notification.findOneAndDelete({
                from: userId,
                to: post.user,
                type: "like"
            });
            res.status(200).json({ message: "Post unliked successfully" });

        } else {
            post.likes.push(userId);
            await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
            await post.save();

            const notification = new Notification({
                from: userId,
                to: post.user,
                type: "like",
            })
            await notification.save();
            res.status(200).json({ message: "Post liked successfully" });
        }

    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
        console.log("error in likeUnlikePost controller", error);
    }
}

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 }).populate("user", "-password")
            .populate("comments.user", "-password") // Populate the user field in comments as well

        if (posts.length === 0) {
            return res.status(200).json({ message: "No posts found" });
        }

        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
        console.log("error in getAllPosts controller", error);

    }

}

export const getLikedPosts = async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const likedPosts = await Post.find({ _id: { $in: user.likedPosts } }).populate("user", "-password")
            .populate("comments.user", "-password") // Populate the user field in comments as well

        res.status(200).json(likedPosts);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
        console.log("error in getLikedPosts controller", error);

    }
}

export const getFollowingPosts = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const following = user.following;
        const feedPosts = await Post.find({ user: { $in: following } }).sort({ createdAt: -1 }).populate("user", "-password").populate("comments.user", "-password") // Populate the user field in comments as well
        res.status(200).json(feedPosts);
    } catch (error) {
        console.log("error in getFollowingPosts controller", error);
        res.status(500).json({ error: "internal server error" })

    }


}

export const getUserPosts = async (req, res) => {
    try {
        
        const { username } = req.params;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
     
        }
        const posts = await Post.find({ user: user._id }).sort({ createdAt: -1 }).populate("user", "-password").populate("comments.user", "-password") // Populate the user field in comments as well
        res.status(200).json(posts);
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
        console.log("error in getUserPosts controller", error);
        
    }

}
   