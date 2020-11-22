var express = require("express");
var router = express.Router();
var bodyParser = require("body-parser");
var cors = require("cors");
var db = require("../../Database/databaseOperations");
var session = require("express-session");
var fs = require("fs");
var logger = require("../Logger/log");
let ENV = JSON.parse(fs.readFileSync("./Configs/routes.config.json", "utf-8"));
var { DATABASE, STATUSCODE } = require("../../Configs/constants.config");

router.use(express.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(cors());

/**
 * @function getContacts
 * @async
 * @description Fetch all the customers and their details
 * @returns All Customers
 */
var getContacts = async function () {
  logger.info("Execution of 'getContacts' method begins");
  var contacts = await db.fetch(DATABASE.CUSTOMER, DATABASE.FETCH_ALL);
  return contacts;
};

/**
 * @httpMethod GET
 * @function getCustomers
 * @async
 * @description Get all the customers and send them to client
 * @param {Object} req
 * @param {Object} res
 */
exports.getCustomers = async function (req, res) {
  try {
    logger.info("GET /dashboard/getCustomer begins");
    logger.info("Calling 'getContacts' method");
    var customers = await getContacts();
    logger.info("Execution of 'getContacts' method ends");
    res
      .status(STATUSCODE.SUCCESS)
      .send({ reason: "success", values: customers });
  } catch (ex) {
    logger.error(
      "Exception status from database, so redirecting back to dashboard"
    );
    res
      .status(STATUSCODE.INTERNAL_SERVER_ERROR)
      .send({ reason: "Exception", values: [] });
  }
};

/**
 * @httpMethod GET
 * @function getDashboardPage
 * @async
 * @description Render the dashboard html file
 * @param {Object} req
 * @param {Object} res
 */
exports.getDashboardPage = async function (req, res) {
  logger.info("GET /dashboard begins");
  res.render("dashboard");
};
