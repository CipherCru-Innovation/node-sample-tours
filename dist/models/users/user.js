"use strict";
/** @format */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const validator_1 = __importDefault(require("validator"));
const bcrypt = __importStar(require("bcryptjs"));
const mongoose_1 = __importStar(require("mongoose"));
const user_middleware_1 = require("./user-middleware");
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'User name must be provided']
    },
    email: {
        type: String,
        required: [true, 'email must be provided'],
        unique: true,
        lowercase: true,
        validate: [validator_1.default.isEmail, 'Invalid email address.']
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Password cannot be empty'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Confirm your password'],
        validate: {
            // This only works on CREATE and SAVE!!!
            validator: function (el) {
                return el === this.password;
            },
            message: 'Password does not match.'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    isActive: {
        type: Boolean,
        default: true,
        select: false
    }
}, 
/*
================================================================
Schema Options
================================================================
*/
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false
});
/*
================================================================
Virtual properties
****************************************************************
Use a regular function when we need to use the this keyword
TODO: populate virtual properties on filter query
****************************************************************
================================================================
*/
/*
================================================================
Indexes
****************************************************************
================================================================
*/
userSchema.index({
    passwordResetToken: 1,
    passwordResetExpires: -1,
    password: 1
});
// MiddleWare Declaration
userSchema.pre('save', user_middleware_1.encryptPasswordOnSave);
userSchema.methods.matchPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = this.passwordChangedAt.getTime() / 1000;
        return JWTTimestamp < changedTimestamp;
    }
    // False means NOT changed
    return false;
};
userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto_1.default.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto_1.default
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    // console.log({ resetToken }, this.passwordResetToken);
    this.passwordResetExpires = Date.now() + 8 * 60 * 60 * 1000;
    return resetToken;
};
exports.default = mongoose_1.default.model('User', userSchema);
