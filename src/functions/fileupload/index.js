import fs from "fs";

export const fileUpload = async (file) => {
	if (file) {
		let base64String = file;
		let base64Image = base64String?.split(";base64,");
		let extension = base64Image[0].split("/").pop();
		const imgName = `${+new Date()}.${extension}`;
		if (!fs.existsSync(process.env.ASSETS_STORAGE)) fs.mkdirSync(process.env.ASSETS_STORAGE);
		fs.writeFileSync(`${process.env.ASSETS_STORAGE}/${imgName}`, base64Image[1], { encoding: "base64" });
		return imgName;
	} else {
		return "";
	}
};
