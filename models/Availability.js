const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    day: { type: String, required: true }, 

    timeSlots: [
      {
        start: { type: String, required: true },
        end: { type: String, required: true },   
      },
    ],

    recurring: {
      enabled: { type: Boolean, default: false },
      daysOfWeek: [String], 
      repeatUntil: { type: Date }, 
    },
  },
  { timestamps: true }
);

const Availability = mongoose.model("Availability", availabilitySchema);
module.exports = Availability;