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

async function getUserById(id) {
    return await prisma.user.findUnique({
        where: {
            userid: id
        }
    })
}

async function getUserByUsername(username) {
    return await prisma.user.findUnique({
        where: {
            username: username
        }
    })
}

async function createFolder(folderName, ownerId) {
    await prisma.folder.create({
        data: {
            name: folderName, 
            userid: ownerId
        }
    })
}



module.exports = {
    createUser, 
    getUserById,
    getUserByUsername, 
    createFolder 
}