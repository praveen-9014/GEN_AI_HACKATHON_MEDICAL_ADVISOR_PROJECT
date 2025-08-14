module.exports = (Score) => {
    const getScores = async (req, res) => {
        try {
            const scores = await Score.findAll({ where: { UserId: req.userId }, order: [["createdAt", "ASC"]] });
            res.json(scores);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    const addScore = async (req, res) => {
        try {
            const { value } = req.body;
            const score = await Score.create({ value, UserId: req.userId });
            res.status(201).json(score);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    return { getScores, addScore };
};
