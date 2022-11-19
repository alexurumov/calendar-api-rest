const { Schema, model } = require("mongoose");

const schema = new Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true
    },
    startTime: { 
        type: Date, 
        required: true 
    },
    endTime: { 
        type: Date, 
        required: true 
    },
    room: { 
        type: String, 
        required: true
    },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

module.exports = model("Meeting", schema);
