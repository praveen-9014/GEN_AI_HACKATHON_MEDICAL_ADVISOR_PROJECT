module.exports = (Medication) => {
    const list = async (req, res) => {
        try {
            const items = await Medication.findAll({ where: { UserId: req.userId }, order: [["createdAt", "DESC"]] });
            res.json(items);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    const create = async (req, res) => {
        try {
            const { name, dosage, scheduleTime, mealTiming, notes } = req.body;
            const item = await Medication.create({ name, dosage, scheduleTime, mealTiming, notes, UserId: req.userId });
            res.status(201).json(item);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    const update = async (req, res) => {
        try {
            const { id } = req.params;
            const { name, dosage, scheduleTime, mealTiming, notes } = req.body;
            const item = await Medication.findOne({ where: { id, UserId: req.userId } });
            if (!item) return res.status(404).json({ message: "Not found" });
            item.name = name ?? item.name;
            item.dosage = dosage ?? item.dosage;
            item.scheduleTime = scheduleTime ?? item.scheduleTime;
            item.mealTiming = mealTiming ?? item.mealTiming;
            item.notes = notes ?? item.notes;
            await item.save();
            res.json(item);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    const remove = async (req, res) => {
        try {
            const { id } = req.params;
            const count = await Medication.destroy({ where: { id, UserId: req.userId } });
            if (count === 0) return res.status(404).json({ message: "Not found" });
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    return { list, create, update, remove };
};
