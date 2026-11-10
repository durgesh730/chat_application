const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const authSchema = new mongoose.Schema({
    username: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        sparse: true,
        match: [/^[a-zA-Z0-9_.]+$/, "Username can only contain letters, numbers, underscores and periods"],
    },
    uniqueId: {
        type: String,
        trim: true,
        unique: true,
        sparse: true,
        index: true,
    },
    name: {
        type: String,
        trim: true,
        required: false,
        default: null,
    },
    profile_image: {
        type: String,
        trim: true,
        default: null,
    },
    email: {
        type: String,
        match: [
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please provide a valid email address",
        ],
        unique: true,
        lowercase: true,
        required: [true, "Please provide an email address"],
    },
    emailVerified: {
        type: Boolean,
        default: false,
    },
    password: {
        type: String,
        required: [true, "Please provide Password"],
        trim: true,
    },
    telephone: {
        type: String,
        required: false,
        trim: true,
        unique: false,
    },
    active: {
        type: Boolean,
        default: true,
    },
    isOnline: {
        type: Boolean,
        default: false,
        index: true,
    },
    lastSeen: {
        type: Date,
        default: Date.now,
    },
    resetToken: {
        token: {
            type: String,
            default: null,
        },
        expiry: {
            type: Date,
            default: null,
        },
    },
}, { timestamps: true });

authSchema.index({ username: 1 }, { unique: true, sparse: true });
authSchema.index({ uniqueId: 1 }, { unique: true, sparse: true });

authSchema.statics.isEmailTaken = async function (email, excludeUserId) {
    const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
    return !!user;
};

authSchema.statics.isUsernameTaken = async function (username, excludeUserId) {
    const user = await this.findOne({ username: username.toLowerCase(), _id: { $ne: excludeUserId } });
    return !!user;
};

authSchema.statics.isTelephoneTaken = async function (telephone, excludeUserId) {
    if (!telephone) return false;
    const user = await this.findOne({ telephone, _id: { $ne: excludeUserId } });
    return !!user;
};

authSchema.statics.getEmails = async function (userIds) {
    const users = await this.find({ _id: { $in: userIds } });
    return users.map((user) => user.email);
};

authSchema.methods.isPasswordMatch = async function (password) {
    return await bcrypt.compare(password, this.password);
};

authSchema.methods.changePassword = async function (password) {
    this.password = password;
    await this.save();
};

authSchema.pre("save", async function (next) {
    if (!this.uniqueId) {
        this.uniqueId = `u_${crypto.randomBytes(4).toString("hex")}`;
    }

    if (!this.username) {
        const base = this.email
            ? this.email.split("@")[0].replace(/[^a-zA-Z0-9_.]/g, "")
            : "user";
        const suffix = crypto.randomBytes(2).toString("hex");
        this.username = `${base.slice(0, 15)}_${suffix}`.toLowerCase();
    }

    if (!this.profile_image || this.profile_image.includes("ui-avatars.com") || this.profile_image.includes("undefined")) {
        const avatarName = encodeURIComponent(this.username || 'user');
        this.profile_image = `https://ui-avatars.com/api/?background=random&size=128&rounded=true&format=png&name=${avatarName}`;
    }

    if (!this.isModified("password")) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

const authModel = mongoose.model("user", authSchema);

module.exports = authModel;
