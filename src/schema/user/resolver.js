// PAKCAGES
import { combineResolvers } from "graphql-resolvers";
import { GraphQLError } from "graphql";
import jwt from "jsonwebtoken";

// FILES
import { isAuthentication, isAdmin } from "../../authentication";
import emailService from "../../functions/emailService";
import { emailCheck, verifyRepeatEntry } from "../../functions/validation";
import { FilterQuery } from "../../functions/dataFilter/generateFilterquery";
import { fileUpload } from "../../functions/fileupload";

// NOTE- for throwing error
// throw new GraphQLError("you are not authenticated", { extensions: { code: 'UNAUTHENTICATED' }, }) for authentication err
// throw new GraphQLError("you are not authenticated", { extensions: { code: 'BAD_USER_INPUT' }, }) for userInputerror err

const generateToken = async (user, expiresIn) => {
	const { id, email } = user;
	return await jwt.sign({ id, email }, process.env.SECRET, { expiresIn });
};

export const userQuery = {
	// GET ME
	me: combineResolvers((parent, args, { models, me }) => {
		return new Promise((resolve, reject) => {
			models.User.findById(me?.id)
				.populate({ path: "roleId" })
				.exec((err, res) => {
					if (err) return reject(err);
					else resolve(res);
				});
		});
	}),

	// GETALLUSER BY PAGINATE
	getAllUser: combineResolvers(isAdmin, (parent, args, { models, me }) => {
		return new Promise(async (resolve, reject) => {
			const filter = JSON.parse(args?.filter);
			const sort = { [args?.sort?.key]: args?.sort?.type };
			const filterText = FilterQuery(args?.search, "userTable");
			const option = {
				page: args?.page,
				limit: args?.limit,
				sort,
				populate: [{ path: "roleId" }],
			};
			models.User.paginate({ ...filter, ...filterText }, option, (err, results) => {
				if (err) reject(err);
				resolve({
					count: results?.total || 0,
					data: results?.docs || [],
				});
			});
		});
	}),
};

export const userMutation = {
	// CREATE USER
	createUser: async (parent, { input }, { models, me }) => {
		// await emailCheck(input?.email);
		await verifyRepeatEntry("User", { email: input?.email }, "This email is already in use");
		return new Promise(async (resolve, reject) => {
			const role = await models?.Role?.findOne({
				roleName: "client",
				isDeleted: false,
			});
			input.roleId = role?.id;
			input.updatedBy = me?.id;
			input.createdBy = me?.id;
			if (input.profilePhoto && input.profilePhoto.search(";base64,") !== -1) {
				input.profilePhoto = await fileUpload(input.profilePhoto);
			}
			await models.User.create(input, async (err, res) => {
				if (err) reject(err);
				resolve(res);
				const code = await emailService.emailNotification(res, "verifyEmail");
				if (code.flag) {
					res.code = code?.data;
					await res.save();
				}
			});
		});
	},

	// SIGNIN USER
	signIn: async (parent, { email, password }, { models, me }) => {
		let filter = { email };
		const user = await models.User.findOne(filter).populate("roleId");
		if (!user)
			throw new GraphQLError("Please enter valid email or userName", {
				extensions: { code: "BAD_USER_INPUT" },
			});

		if (!(await user.validatePassword(password)))
			throw new GraphQLError("Invalid Password", {
				extensions: { code: "BAD_USER_INPUT" },
			});

		if (!user.isVerified) {
			const code = await emailService.emailNotification(user, "verifyEmail");
			if (code.flag) {
				user.code = code?.data;
				await user.save();
			}
			throw new GraphQLError("Your Email Verification is pending.", {
				extensions: { code: "BAD_USER_INPUT" },
			});
		}

		user.save();
		return {
			token: generateToken(user, "8h"),
			user: user,
		};
	},

	// UPDATE USER
	updateUser: combineResolvers(isAuthentication, async (parent, { input }, { models, me }) => {
		input.updatedBy = me?.id;
		if (input.profilePhoto && input.profilePhoto.search(";base64,") !== -1) {
			input.profilePhoto = await fileUpload(input.profilePhoto);
		}
		const user = await models.User.findById(me?.id);

		// email validation
		if (user?.email !== input?.email && input?.email) await emailCheck(input?.email);

		return new Promise((resolve, reject) => {
			models.User.findOneAndUpdate({ _id: me?.id, isDeleted: false }, input, { new: true }, (err, res) => {
				if (err) return reject(err);
				else resolve(res);
			});
		});
	}),

	// DELETE USER
	deleteUser: combineResolvers(isAuthentication, async (parent, args, { models, me }) => {
		const userId = args?.id;
		return new Promise((resolve, reject) => {
			models.User.findOneAndUpdate({ _id: me?.id }, { isDeleted: true }, { new: true }, (err, res) => {
				if (err) return reject(err);
				else resolve(true);
			});
		});
	}),

	// FORGOTPASSWORD
	forgotPassword: async (parent, { email }, { models, me }) => {
		const user = await models.User.findOne({ email, isDeleted: false });
		return new Promise(async (resolve, reject) => {
			if (!user) reject("User is not exist");
			else {
				resolve(true);
				const code = await emailService.emailNotification(user, "forgotPassword");
				if (!code.flag) reject(false);
				else {
					user.code = code?.data;
					await user.save();
				}
			}
		});
	},

	// RESET PASSWORD
	resetPassword: async (parent, { id, code, password }, { models, me }) => {
		let user;
		if (!id) user = await models.User.findOne({ code });
		else user = await models.User.findById(id);

		if (!user)
			throw new GraphQLError("User not found.", {
				extensions: { code: "BAD_USER_INPUT" },
			});

		if (user?.code !== code)
			throw new GraphQLError("Reset password link is expired or invalid, please try again", { extensions: { code: "BAD_USER_INPUT" } });

		user.isVerified = true;
		user.password = password;
		user.code = "";
		await user.save();
		return true;
	},

	// VERIFY EMAIL
	verifyEmail: async (parent, { id, code }, { models, me }) => {
		const user = await models.User.findById(id);
		if (!user) {
			throw new GraphQLError("User not found.", {
				extensions: { code: "BAD_USER_INPUT" },
			});
		}
		if (user?.isVerified) {
			throw new GraphQLError("You are already verified", {
				extensions: { code: "BAD_USER_INPUT" },
			});
		}
		if (user?.code !== code) {
			throw new GraphQLError("Verification link is expired or invalid, please try again", { extensions: { code: "BAD_USER_INPUT" } });
		}
		user.isVerified = true;
		user.code = "";
		await user.save();
		return true;
	},

	// CHANGE PASSWORD
	changePassword: combineResolvers(isAuthentication, async (parent, { oldPassword, newPassword }, { me }) => {
		const isMach = await me.validatePassword(oldPassword);
		if (!isMach) {
			throw new GraphQLError("Your old password does not match.", { extensions: { code: "BAD_USER_INPUT" } });
		}
		if (newPassword === oldPassword) {
			throw new GraphQLError("Your new password cannot be same as old password", { extensions: { code: "BAD_USER_INPUT" } });
		}
		me.password = newPassword;
		await me.save();
		return true;
	}),

	// MULTIPLE DOCUMENT UPLOAD
	// input img String must have an array of string
	mutipleDocumentUpload: combineResolvers(isAuthentication, (parents, { input }) => {
		return new Promise((resolve, reject) => {
			if (input.length > 0) {
				const documents = input.map(async (img) => {
					const doc = await fileUpload(img);
					return doc;
				});
				resolve(documents);
				// if (documents) {
				// 	resolve(documents);
				// 	fs.unlink("", function (err) {
				// 		if (err) throw err;
				// 		console.log("File deleted!");
				// 	});-+
				// }
			} else {
				reject("Please provide a valid Document");
			}
		});
	}),
};
