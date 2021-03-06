const { DATABASE } = require("../../Configs/constants.config");
var db = require("../../Database/databaseOperations");

module.exports.saveImageIntoDB = async function (LoggedInUser, imgUri) {
  try {
    await db.update(
      DATABASE.CUSTOMER,
      "email",
      LoggedInUser,
      ["img_data"],
      [imgUri]
    );
  } catch (exc) {
    throw exc;
  }
};

module.exports.insertUserData = async function (tableID, data) {
  try {
    var result = await db.insert(tableID, data);
    return result;
  } catch (exc) {
    throw exc;
  }
};
