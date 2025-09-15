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

async function getFolderById(folderid) {
    return await prisma.folder.findUnique({
        where: {
            folderid: folderid
        }
    })
}

async function getFileById(fileid) {
    return await prisma.file.findUnique({
        where: {
            fileid: fileid
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
            children: true , 
            files: true
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

async function createFile(fileObj) {
    await prisma.file.create({
        data: {
            name: fileObj.name, 
            size: fileObj.size, 
            mimetype: fileObj.mimetype,
            userid: fileObj.ownerId, 
            path: fileObj.path, 
            publicUrl: fileObj.publicUrl
        }
    })
}

async function createFileToFolder(parentFolderId, fileObj) {
    await prisma.folder.update({
        where : {
            folderid: parentFolderId
        }, 
        data : {
            files: {
                create: {
                    name: fileObj.name, 
                    size: fileObj.size, 
                    mimetype: fileObj.mimetype,
                    userid: fileObj.ownerId, 
                    path: fileObj.path, 
                    publicUrl: fileObj.publicUrl
                }
            }
        }
    })
}


async function deleteFolder(folderId) {
    const deleteRelatedFolders = prisma.folder.deleteMany({
        where : {
            parentid: folderId
        }
    })
    
    const deleteRelatedFiles = prisma.file.deleteMany({
        where: {
            folderid: folderId
        }
    })

    const deleteMainFolder = prisma.folder.delete({
        where: {
            folderid: folderId
        }
    })

    await prisma.$transaction(
        [deleteRelatedFolders, deleteRelatedFiles, deleteMainFolder]
    )
}

async function deleteFile(fileid) {
    await prisma.file.delete({
        where: {
            fileid: fileid
        }
    })
}

async function addFolderShareId(folderid, shareid) {
    return await prisma.folder.update({
        where: {
            folderid: folderid
        }, 
        data: {
            shareId: shareid
        }
    })
}

module.exports = {
    createUser, 
    getUserById,
    getUserByUsername, 
    createFolder, 
    getFolderById,
    getFileById,
    getUserFiles, 
    getFolderFiles, 
    createNestedFolder, 
    createFile, 
    createFileToFolder, 
    deleteFolder, 
    deleteFile, 
    addFolderShareId
}