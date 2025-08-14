const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

// Factory to inject Sequelize User model
module.exports = (User) => {
    // Signup
    const signup = async (req, res) => {
        try {
            const { username, email, password } = req.body;

            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                return res.status(400).json({ message: "Valid email is required" });
            }

            const existingUser = await User.findOne({ where: { [Op.or]: [{ username }, { email }] } });
            if (existingUser) {
                return res.status(400).json({ message: "Username or email already exists" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            await User.create({ username, email, password: hashedPassword });

            res.json({ message: "User registered successfully" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    // Login
    const login = async (req, res) => {
        try {
            const { username, email, password } = req.body;

            const where = username ? { username } : { email };
            const user = await User.findOne({ where });
            if (!user) {
                return res.status(400).json({ message: "Invalid username or password" });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Invalid username or password" });
            }

            const token = jwt.sign({ id: user.id }, "secretkey", { expiresIn: "7d" });
            res.json({ token, username: user.username, email: user.email });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    return { signup, login };
};
