const Availability = require("../models/Availability");
const { isOverlapping, generateRecurringDays } = require("../utils/availabilityUtils");
const { generateICal } = require("../utils/icalHelper");
const logger = require("../utils/logger");
const moment = require("moment");

const setAvailability = async (req, res, next) => {
  try {
    const { day, timeSlots, recurring } = req.body;

    logger.info(` Setting availability for user: ${req.user.id} on ${day}`);

    if (isOverlapping([...timeSlots])) {
      logger.warn(" Time slots overlap detected");
      return res.status(400).json({ msg: "Time slots overlap!" });
    }

    // For recurring availability
    if (recurring?.enabled && recurring.daysOfWeek && recurring.repeatUntil) {
      const recurringDays = generateRecurringDays(day, recurring.repeatUntil, recurring.daysOfWeek);

      const bulk = recurringDays.map((recDay) => ({
        updateOne: {
          filter: { user: req.user.id, day: recDay },
          update: { user: req.user.id, day: recDay, timeSlots, recurring },
          upsert: true,
        },
      }));

      await Availability.bulkWrite(bulk);
      logger.info(` Recurring availability set for ${recurringDays.length} days`);
      return res.status(201).json({ message: "Recurring availability set" });
    }

    // Non-recurring
    const existing = await Availability.findOne({ user: req.user.id, day });

    if (existing) {
      existing.timeSlots = timeSlots;
      await existing.save();
      logger.info(" Availability updated");
      return res.json({ message: "Availability updated", availability: existing });
    }

    const availability = await Availability.create({
      user: req.user.id,
      day,
      timeSlots,
      recurring,
    });

    logger.info(" Availability created");
    res.status(201).json({ message: "Availability set", availability });
  } catch (err) {
    logger.error(" Error in setAvailability:", err);
    next(err);
  }
};

const getAvailability = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const availability = await Availability.find({ user: userId || req.user.id });

    logger.info(` Retrieved availability for user ${userId || req.user.id}`);
    res.json({ availability });
  } catch (err) {
    logger.error(" Error in getAvailability:", err);
    next(err);
  }
};

const deleteAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Availability.findOneAndDelete({ _id: id, user: req.user.id });

    if (!deleted) {
      logger.warn(" Availability not found for deletion");
      return res.status(404).json({ message: "Not found" });
    }

    logger.info(` Availability deleted: ${id}`);
    res.json({ message: "Availability deleted" });
  } catch (err) {
    logger.error(" Error in deleteAvailability:", err);
    next(err);
  }
};

const User = require("../models/User");

const sendEmail = require("../utils/mailer");

const exportICal = async (req, res, next) => {
  try {
    const availabilities = await Availability.find({ user: req.user.id });
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const calendar = generateICal(availabilities, user);

    res.setHeader("Content-Disposition", "attachment; filename=availability.ics");
    res.setHeader("Content-Type", "text/calendar");

    logger.info(" Exported availability as .ics");
    res.send(calendar.toString());
  } catch (err) {
    logger.error(" Error in exportICal:", err);
    next(err);
  }
};

const sendICalEmail = async (req, res, next) => {
  try {
    const availabilities = await Availability.find({ user: req.user.id });
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const calendar = generateICal(availabilities, user);
    const icalString = calendar.toString();

    await sendEmail({
      to: user.email,
      subject: "Your Availability iCal",
      html: "<p>Please find your availability calendar attached.</p>",
      attachments: [
        {
          filename: "availability.ics",
          content: icalString,
          contentType: "text/calendar",
        },
      ],
    });

    logger.info(` Sent availability iCal email to ${user.email}`);
    res.json({ message: "Availability iCal email sent" });
  } catch (err) {
    logger.error(" Error in sendICalEmail:", err);
    next(err);
  }
};

module.exports = {
  setAvailability,
  getAvailability,
  deleteAvailability,
  exportICal,
  sendICalEmail,
};
