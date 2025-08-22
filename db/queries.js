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

async function getUserFiles(ownerId) {
    const [ folders, files ] = await prisma.$transaction([
        prisma.folder.findMany({
            where: {
                userid: ownerId,
                parentid: null
            }
        }), 
        prisma.file.findMany({
            where: {
                folderid: null
            }
        })
    ])

    return folders.concat(files);
}

module.exports = {
    createUser, 
    getUserById,
    getUserByUsername, 
    createFolder, 
    getUserFiles 
}