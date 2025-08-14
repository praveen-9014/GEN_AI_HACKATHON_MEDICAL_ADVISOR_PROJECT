const bcrypt = require("bcryptjs");

module.exports = (User) => {
    const getMe = async (req, res) => {
        try {
            const user = await User.findByPk(req.userId, { attributes: ["id", "username", "email", "createdAt"] });
            if (!user) return res.status(404).json({ message: "Not found" });
            res.json(user);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    const updateMe = async (req, res) => {
        try {
            const { username, email, password } = req.body;
            const user = await User.findByPk(req.userId);
            if (!user) return res.status(404).json({ message: "Not found" });
            if (username) user.username = username;
            if (email) user.email = email;
            if (password) user.password = await bcrypt.hash(password, 10);
            await user.save();
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    return { getMe, updateMe };
};
