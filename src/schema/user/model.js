import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema({
	userName: String,
	email: String,
	password: String,
	roleId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "role",
	},
	isVerified: {
		type: Boolean,
		default: false,
	},
	isDeleted: {
		type: Boolean,
		default: false,
	},
});

userSchema.plugin(mongoosePaginate);

userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) next();
	this.password = await bcrypt.hash(this.password, 12);
	next();
});

userSchema.methods.validatePassword = async function (password) {
	return await bcrypt.compare(password, this.password);
};

export const User = new mongoose.model("user", userSchema);
