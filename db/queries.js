const { PrismaClient } = require('@prisma/client')

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


async function getFolderFiles(folderId) {
    return await prisma.folder.findUnique({
        where: {
            folderid: folderId
        }, 
        include: {
            children: true
        }
    })
}

async function createNestedFolder(parentFolderId, ownerId, folderName) {
    await prisma.folder.update({
        where : {
            folderid: parentFolderId
        } , 
        data : {
            children: {
                create : {
                    name: folderName, 
                    userid: ownerId
                }
            }
        }
    })
}

async function createFile(name, size, ownerId, filedata) {
    await prisma.file.create({
        data: {
            name: name, 
            size: size, 
            userid: ownerId, 
            filedata: filedata
        }
    })
}

module.exports = {
    createUser, 
    getUserById,
    getUserByUsername, 
    createFolder, 
    getUserFiles, 
    getFolderFiles, 
    createNestedFolder, 
    createFile
}