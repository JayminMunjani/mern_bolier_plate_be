/****************************************************
 * MONGO ROLE COLLECTION MODEL
 * Defines fields of ROLE
 ****************************************************/
import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate";

let ObjectId = mongoose.Schema.Types.ObjectId;

const roleSchema = new mongoose.Schema(
	{
		roleName: String,
		isAdminCreated: {
			type: Boolean,
			default: false,
		},
		isDeleted: {
			type: Boolean,
			default: false,
		},
		createdBy: {
			type: ObjectId,
			ref: "user",
		},
		updatedBy: {
			type: ObjectId,
			ref: "user",
		},
	},
	{ timestamps: true }
);

roleSchema.plugin(mongoosePaginate);
export const Role = mongoose.model("role", roleSchema);
