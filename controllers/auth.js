const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken");
const { User } = require("../models/user");

const registeredUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email or password missing"
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword
        });


        const token = jwt.sign({ userId: newUser._id, name: newUser.name, email: newUser.email }, process.env.SECRET_KEY);

        res.json({
            message: "User created successfully",
            token
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = {};
            Object.keys(error.errors).forEach((key) => {
                errors[key] = error.errors[key].message;
            });
            return res.status(400).json({ errors });
        }
        res.status(500).json({ message: "Internal server error" });
    }
};

const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "email or password is empty"
            });
        }
        const userDetails = await User.findOne({ email });
        if (!userDetails) {
            return res.status(400).json({
                message: "invalid email"
            });
        }
        const passwordMatch = await bcrypt.compare(
            password,
            userDetails.password
        );
        if (!passwordMatch) {
            return res.status(400).json({
                message: "password is incorrect"
            });
        }

        const token = jwt.sign({ userId: userDetails._id, name: userDetails.name, email: userDetails.email }, process.env.SECRET_KEY);
        res.json({
            message: "user logged in successfully",
            token: token
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

const reset = async (req, res, next) => {
    try {
        const { newName, currentPassword, newPassword, newEmail } = req.body;

        const user = await User.findOne({ email: req.user.email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const updates = {};
        let shouldUpdate = false;

        if (newName && newName !== user.name) {
            updates.name = newName;
            shouldUpdate = true;
        }

        if (newEmail && newEmail !== user.email) {
            const existingEmail = await User.findOne({ email: newEmail });
            if (existingEmail) {
                return res.status(400).json({ message: "Email already taken" });
            }
            updates.email = newEmail;
            shouldUpdate = true;
        }

        if (newPassword) {
            const passwordMatch = await bcrypt.compare(currentPassword, user.password);
            if (!passwordMatch) {
                return res.status(400).json({ message: "Current password is incorrect" });
            }
            const isSamePassword = await bcrypt.compare(newPassword, user.password);
            if (isSamePassword) {
                return res.status(400).json({ message: "New password must be different from the old password" });
            }
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            updates.password = hashedNewPassword;
            shouldUpdate = true;
        }

        if (shouldUpdate === false) {
            return res.status(400).json({ message: "No updates made. Please update at least one field." });
        }

        Object.assign(user, updates);
        await user.save();

        return res.json({ message: "User details updated successfully" });
    } catch (error) {
        next(error);
    }
}

module.exports = { registeredUser, loginUser, reset }
