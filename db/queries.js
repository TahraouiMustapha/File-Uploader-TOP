const { PrismaClient } = require("../generated/prisma")

const prisma = new PrismaClient()

async function createUser(username, password) {
    await prisma.user.create({
        data: {
            username: username, 
            password: password
        }
    })
}



module.exports = {
    createUser
}