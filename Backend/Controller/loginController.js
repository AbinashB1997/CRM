var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var cors = require('cors')
var db = require("../../Database/databaseOperations")
var fs = require('fs')
let ENV = JSON.parse(fs.readFileSync("./Configs/routes.config.json", 'utf-8'))
var session = require('express-session');
var logger = require('../Logger/log')

router.use(express.json());
router.use(bodyParser.urlencoded({extended: true}));
router.use(cors());

var isValidUser = async function(email, password) {
    logger.info("Execution of \'isValidUser\' method begins")
    var isExistingUser = await db.isExistingUser("email", email);
    if(isExistingUser) {
        return await db.isValidUser("email", email, password);
    }
}

exports.getLoginPage = async function(req, res) {
    logger.info("GET /login begins")
    res.render('register', {
        regEndpoint : ENV.endpoints.server + ENV.routes.reg,
        loginEndpoint : ENV.endpoints.server + ENV.routes.login
    })
}

exports.login = async function(req, res) {
    try {
        logger.info("POST /login begins")
        logger.info(`POST /login body ===> ${JSON.stringify(req.body)}`)
        var email = req.body.email
        var password = req.body.password
        logger.info("Calling \'isValidUser\' method")
        var validUser = await isValidUser(email, password)
        logger.info("Execution of \'isValidUser\' method ends")
        if(validUser) {
            logger.info("User validation successful, so redirecting back to dashboard")
            req.session.user = email
            req.session.password = password
            res.redirect("/dashboard")
        }else {
            logger.error("User validation failed, so redirecting back to login")
            res.redirect('/login');
        }
    } catch (ex) {
        logger.error(`POST /login Captured Error ===> ${ex}`)
        res.redirect('/login')
    }
}