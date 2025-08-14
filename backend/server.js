const express = require("express");
const cors = require("cors");
const { Sequelize } = require("sequelize");

const app = express();
app.use(cors());
app.use(express.json());

const sequelize = new Sequelize("medical_advisor", "root", "praveen@9014", {
    host: "localhost",
    dialect: "mysql"
});

const User = require("./models/User")(sequelize);
const Medication = require("./models/Medication")(sequelize);
const Score = require("./models/Score")(sequelize);

// Associations
User.hasMany(Medication);
Medication.belongsTo(User);
User.hasMany(Score);
Score.belongsTo(User);

const authController = require("./controllers/authController")(User);
const medicationController = require("./controllers/medicationController")(Medication);
const scoreController = require("./controllers/scoreController")(Score);
const profileController = require("./controllers/profileController")(User);

const authRoutes = require("./routes/authRoutes")(authController);
const medicationRoutes = require("./routes/medicationRoutes")(medicationController, require("./middleware/authMiddleware"));
const scoreRoutes = require("./routes/scoreRoutes")(scoreController, require("./middleware/authMiddleware"));
const profileRoutes = require("./routes/profileRoutes")(profileController, require("./middleware/authMiddleware"));
app.use("/api/auth", authRoutes);
app.use("/api/medications", medicationRoutes);
app.use("/api/scores", scoreRoutes);
app.use("/api/profile", profileRoutes);

sequelize.authenticate()
    .then(() => {
        console.log("MySQL Connected");
        return sequelize.sync({ alter: true });
    })
    .then(() => console.log("Database synced"))
    .catch(err => console.error("Database error:", err));

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
