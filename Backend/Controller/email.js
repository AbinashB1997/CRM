var express = require("express");
var router = express.Router();
var bodyParser = require("body-parser");
var cors = require("cors");
var db = require("../../Database/databaseOperations");
var session = require("express-session");
var mailer = require("nodemailer");
var logger = require("../Logger/log");
var CryptoJs = require("crypto-js");
var AES = require("crypto-js/aes"); // Advanced Encryption Standard
router.use(express.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(cors());
var {
  DATABASE,
  CYPHER,
  ResponseIds,
} = require("../../Configs/constants.config");
const { validatePayload, processPayload, format } = require("./main_utils");
const { emailPayloadSchema } = require("./schema");
const httpStatus = require("http-status");
const {
  buildErrorReasons,
  buildResponse,
  getEndMessage,
} = require("./response_utils");

var SERVICE_NAME = "gmail";
var FROM = "from";
var TO = "to";
var SUBJECT = "subject";
var TEXT = "text";
var EMAIL = "email";
/**
 * @function getPassCode
 * @async
 * @description Gets the Google App Password of the sender
 * @param {string} email
 * @returns Sends Google App Password as an acknowledgement
 */
var getPassCode = async function (email) {
  logger.info(`In getPassCode to fetch passcode for userId: ${email}`);
  var userCred = await db.fetch(
    DATABASE.CREDENTIALS,
    DATABASE.FETCH_SPECIFIC,
    EMAIL,
    email
  );
  return userCred[0].passcode;
};

/**
 * @httpMethod POST
 * @function email
 * @async
 * @description Sends email to user
 * @param {Object} req
 * @param {Object} res
 */
module.exports.email = async function (req, res) {
  try {
    logger.info("POST /email begins");
    var payload = await processPayload(req.body);
    payload[FROM] = req.session.user;
    payload[TO] = payload.email || "";
    delete payload.email;
    payload[SUBJECT] = payload.subject || "";
    payload[TEXT] = payload.body || "";
    delete payload.body;
    var [isValidPayload, errorList] = await validatePayload(
      payload,
      emailPayloadSchema
    );
    if (!isValidPayload) {
      logger.info(`Invalid Payload with errorList = ${errorList}`);
      var reasons = await buildErrorReasons(errorList);
      var response = await buildResponse(
        null,
        reasons,
        httpStatus.UNPROCESSABLE_ENTITY,
        "RI_004"
      );
      res.status(httpStatus.UNPROCESSABLE_ENTITY).send(response);
    } else {
      var transPortFields = {
        service: SERVICE_NAME,
        auth: {
          user: payload.from,
          pass: await getPassCode(payload.from),
        },
      };
      var transporter = mailer.createTransport(transPortFields);
      payload[SUBJECT] = AES.decrypt(
        payload.subject,
        CYPHER.DECRYPTION_KEY
      ).toString(CryptoJs.enc.Utf8);
      payload[TEXT] = AES.decrypt(payload.text, CYPHER.DECRYPTION_KEY).toString(
        CryptoJs.enc.Utf8
      );
      var mailOptions = payload;
      try {
        await transporter.sendMail(mailOptions);
        logger.info("Successfully sent email");
        var response = await buildResponse(
          null,
          format(ResponseIds.RI_013, [payload.to]),
          httpStatus.OK,
          "RI_013"
        );
        logger.info(getEndMessage(ResponseIds.RI_005, req.method, req.path));
        res.status(httpStatus.OK).send(response);
      } catch (emailException) {
        logger.error(`Error: ${emailException}`);
        var response = await buildResponse(
          null,
          format(ResponseIds.RI_014, [payload.to]),
          httpStatus.BAD_REQUEST,
          "RI_014"
        );
        res.status(httpStatus.BAD_REQUEST).send(response);
      }
    }
  } catch (ex) {
    logger.error(`Error in POST /email: ${ex}`);
    var response = await buildResponse(null, ex, httpStatus.BAD_GATEWAY);
    res.status(httpStatus.BAD_GATEWAY).send(response);
  }
};
