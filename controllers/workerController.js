import User from "../models/User.js";

// GET /api/workers/search  — search with filters + pagination
export const searchWorkers = async (req, res) => {
  try {
    const { q, skill, city, available, verified, sort, page = 1, limit = 6 } = req.query;

    const query = { role: "worker" };

    if (skill)     query.skill = skill;
    if (city)      query.city  = city;
    if (available === "true") query.isAvailable = true;
    if (verified  === "true") query.isVerified  = true;

    if (q) {
      query.$or = [
        { name:  { $regex: q, $options: "i" } },
        { skill: { $regex: q, $options: "i" } },
        { skills:{ $elemMatch: { $regex: q, $options: "i" } } },
        { city:  { $regex: q, $options: "i" } },
      ];
    }

    let sortObj = { avgRating: -1 };
    if (sort === "rate_low")  sortObj = { hourlyRate:  1 };
    if (sort === "rate_high") sortObj = { hourlyRate: -1 };
    if (sort === "jobs")      sortObj = { jobsDone:   -1 };

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);
    const workers = await User.find(query)
      .select("-otp -otpExpiry")
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit));

    res.json({ workers, total, page: Number(page) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/workers  — all workers (simple, no pagination)
export const getWorkers = async (req, res) => {
  try {
    const { skill, city } = req.query;
    const query = { role: "worker" };
    if (skill) query.skill = skill;
    if (city)  query.city  = city;
    const workers = await User.find(query).select("-otp -otpExpiry");
    res.json(workers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/workers/:id
export const getWorkerById = async (req, res) => {
  try {
    const worker = await User.findById(req.params.id).select("-otp -otpExpiry");
    if (!worker) return res.status(404).json({ message: "Worker not found" });
    res.json(worker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/workers/profile  (protected)
export const updateWorkerProfile = async (req, res) => {
  try {
    const { skill, skills, experience, hourlyRate, about, isAvailable, city, name, companyName, companyType } = req.body;

    const updates = {};
    if (name        !== undefined) updates.name        = name;
    if (city        !== undefined) updates.city        = city;
    if (skill       !== undefined) updates.skill       = skill;
    if (skills      !== undefined) updates.skills      = skills;
    if (experience  !== undefined) updates.experience  = Number(experience);
    if (hourlyRate  !== undefined) updates.hourlyRate  = Number(hourlyRate);
    if (about       !== undefined) updates.about       = about;
    if (isAvailable !== undefined) updates.isAvailable = isAvailable;
    if (companyName !== undefined) updates.companyName = companyName;
    if (companyType !== undefined) updates.companyType = companyType;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select("-otp -otpExpiry");
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
