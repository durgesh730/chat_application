const express = require("express")
const router = express.Router()
const auth = require('./auth.route')
const apiAuthMiddleware = require('../../middleware/Api-auth.middleware').auth;
const message = require("./message.route")

const defaultRoutes = [
    {
        path: "/auth",
        route: auth
    }
]

const authRoutes = [
    {
        path: "/message",
        route: message
    },
]

// without authentication
defaultRoutes.forEach((route) => {
    router.use(route.path, route.route)
})

//Auth route
router.use(apiAuthMiddleware);

authRoutes.forEach((route) => {
    router.use(route.path, route.route)
})

module.exports = router