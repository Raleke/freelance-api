const { writeFileSync } = require("fs");
const icalModule = require("ical-generator");
const ical = icalModule.default || icalModule;

const generateICal = (availabilities, user) => {
  if (!user.name || !user.email) {
    throw new Error("User name and email are required for iCal generation");
  }

  const cal = ical({ name: `${user.name}'s Availability` });

  availabilities.forEach((slot) => {
    slot.timeSlots.forEach((ts) => {
      const start = new Date(`${slot.day}T${ts.start}`);
      const end = new Date(`${slot.day}T${ts.end}`);

      cal.createEvent({
        start,
        end,
        summary: "Available Slot",
        description: `Available on ${slot.day}`,
        location: "Remote",
        organizer: {
          name: user.name,
          email: user.email,
        },
      });
    });
  });

  return cal;
};

module.exports = { generateICal };
