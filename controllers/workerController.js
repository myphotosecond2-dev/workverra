import User from "../models/User.js";

export const getWorkers = async (req, res) => {
  try {
    const { skill, city } = req.query;
    let query = { role: "worker" };
    if (skill) query.skill = skill;
    if (city) query.city = city;
    const workers = await User.find(query).select("-otp -otpExpiry");
    res.json(workers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWorkerById = async (req, res) => {
  try {
    const worker = await User.findById(req.params.id).select("-otp -otpExpiry");
    if (!worker) return res.status(404).json({ message: "Worker not found" });
    res.json(worker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
