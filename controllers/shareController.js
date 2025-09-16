const asyncHandler = require('express-async-handler')
const db = require('../db/queries')

const { getPath, getSize } = require('../services/foldersServices')
const { compareAsc, format } = require('date-fns')

const getSharedFolder = asyncHandler(async (req, res)=> {
    const { shareid } = req.params
    
    if(!shareid) {
        return res.status(400).json({error: "Invalid share id"})
    }

    const sharedFolder = await db.getSharedFolder(shareid)
    if(!sharedFolder) return res.status(404).json({error: "Folder not found"})

    const folders = sharedFolder?.children.length > 0
    const files = sharedFolder?.files.length > 0

    let foldersAndFiles = null
    if(folders || files) {
        foldersAndFiles = sharedFolder.children.concat(sharedFolder.files)
                        .sort((a, b)=> compareAsc(a.createdDate, b.createdDate))
        foldersAndFiles = foldersAndFiles.map(file => (
            {
                ...file, 
                createdDate: format(file.createdDate, 'PPP'),
                size: file.size ? getSize(file.size) : null
            }
        ))                        
    }

    const actualLink = req.originalUrl
    let path = await getPath(sharedFolder, {isShared: true, folderid: sharedFolder.folderid})

    // make path array like  [ { folderName: 'New Folder', folderHref: '/folders/40' } ]
    path = path.map(pathObj => ({
        ...pathObj, 
        folderHref: `${actualLink}/${pathObj.folderHref.split('/').at(-1)}`
    }))

    res.render("sharedView",{
        userFiles: foldersAndFiles, 
        path: path, 
        isShared: true, 
        sharedLink: actualLink 
    })
})


const getNestedFolder = asyncHandler(async (req, res)=> {
    const { shareid, folderid } = req.params

    if(!shareid || !folderid || isNaN(Number(folderid))) {
        return res.status(400).json({error: "Invalid ids"})
    }

    // get the folder shared
    const rootFolder = await db.getSharedFolder(shareid)
    if(!rootFolder) return res.status(404).json({error: "Shared folder not found"})

    const folderObj = await db.getFolderFiles(Number(folderid))
    if(!folderObj) return res.status(404).json({error: "folder not found"})

    const folders = folderObj?.children.length > 0
    const files = folderObj?.files.length > 0

    let foldersAndFiles = null
    if(folders || files) {
        foldersAndFiles = folderObj.children.concat(folderObj.files)
                        .sort((a, b)=> compareAsc(a.createdDate, b.createdDate))
        foldersAndFiles = foldersAndFiles.map(file => (
            {
                ...file, 
                createdDate: format(file.createdDate, 'PPP'),
                size: file.size ? getSize(file.size) : null
            }
        ))                        
    }

    // Get the first 3 parts of the original URL (to avoid deep nested paths)
    const actualLink = req.originalUrl.split('/').slice(0, 3).join('/')
    let path = await getPath(folderObj, {isShared: true, folderid: rootFolder.folderid})

    // make path array like  [ { folderName: 'New Folder', folderHref: '/folders/40' } ]
    path = path.map(pathObj => ({
        ...pathObj, 
        folderHref: `${actualLink}/${pathObj.folderHref.split('/').at(-1)}`
    }))

    res.render("sharedView", {
        userFiles: foldersAndFiles, 
        path: path, 
        isShared: true, 
        sharedLink: actualLink 
    })
    
})


module.exports = {
    getSharedFolder, 
    getNestedFolder 
}