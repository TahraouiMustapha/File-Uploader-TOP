const db = require("../db/queries")
const asyncHandler = require('express-async-handler')
const { compareAsc, format } = require("date-fns");

const { getPath, getSize } = require('../services/foldersServices') 
const FileService = require('../services/FileService')

const {v4: uuidV4} = require('uuid');


const mainPage = asyncHandler (async (req, res)=> {
    const {user} = req;
    const { selectedFileId } = req.query

    if(!user) {
        return res.render("sign-up", {
            title: 'Sign Up'
        })
    }
    
    files = await db.getUserFiles(user.userid)
    files.sort((a, b)=> compareAsc(a.createdDate, b.createdDate));
    files = files.map(file => (
        {
            ...file, 
            createdDate: format(file.createdDate, 'PPP'),
            size: file.size ? getSize(file.size) : null
        }
    ))
        
    let fileObj = null
    if(selectedFileId) {
        fileObj = await db.getFileById(Number(selectedFileId))
        if(fileObj) fileObj = {
            ...fileObj, 
            size: getSize(fileObj.size),
            createdDate: format(fileObj.createdDate, 'PPP   h:m aa' )
        }
    }

    res.render("main", {
        userFiles: files?.length == 0 ? null : files , 
        newFolderHref: '/folders/new-folder' , 
        newFileHref: '/files/new-file', 
        clickedFile: fileObj
    })
})

const createFolder = asyncHandler( async (req, res) => {
    let { folderName } = req.body;
    const { userid } = req.user;


    if (folderName.trim() == '') folderName = 'New Folder';

    await db.createFolder(folderName, userid)

    res.redirect(req.get('referer') || '/')
})


const appearFolderContent = asyncHandler(async (req, res)=> {
    const { folderid } = req.params;
    const { selectedFileId } = req.query
    
    const folderObj = await db.getFolderFiles(Number(folderid))
    const newFolderHref = `/folders/${folderObj.folderid}/new-folder`;
    const newFileHref = `/files/${folderObj.folderid}/new-file`;
    

    const folders = folderObj?.children.length !== 0
    const files = folderObj?.files.length !== 0

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

    const path = await getPath(folderObj)

    let fileObj = null
    if(selectedFileId) {
        fileObj = await db.getFileById(Number(selectedFileId))
        if(fileObj) fileObj = {
            ...fileObj, 
            size: getSize(fileObj.size), 
            createdDate: format(fileObj.createdDate, 'PPP   h:m aa' )
        }
    }

    res.render("main" , {
        rootFolder: folderObj, 
        path: path,
        userFiles: foldersAndFiles, 
        newFolderHref: newFolderHref, 
        newFileHref: newFileHref, 
        clickedFile: fileObj
    })
})

const createNestedFolder = asyncHandler(async (req, res)=> {
    const { folderid } = req.params;
    const { userid } = req.user;
    let { folderName } = req.body;

    if (folderName.trim() == '') folderName = 'New Folder';

    await db.createNestedFolder(Number(folderid), Number(userid), folderName);

    const path = `/folders/${folderid}`
    res.redirect(path)
})


const deleteFolder = asyncHandler(async (req, res)=> {
    const { folderid } = req.params;

    const folder = await db.getFolderFiles(Number(folderid))

    if(folder.files.length > 0){    
        // delete related files from supabase storage
        const arrOfFiles = folder.files.map((file)=> file.path )
        await FileService.deleteManyFiles(arrOfFiles)
    }

    let folderParent = null;
    if(folder.parentid) {
        folderParent = await db.getFolderById(Number(folder.parentid))
    }

    await db.deleteFolder(Number(folderid))


    folderParent ?
    res.redirect(`/folders/${folderParent.folderid}`) :
    res.redirect('/') ; 
})

const generateShareLink = asyncHandler(async (req, res)=> {
    const { folderid } = req.params;

    if(!folderid || isNaN(Number(folderid))) {
        return res.status(400).json({error: "Invalid folder id"})
    }
    const folder = await db.getFolderById(Number(folderid))
    
    if(!folder) return res.status(403).json({error: "Folder not found"})

    let shareid = folder.shareId
    if(!shareid) {
        shareid = uuidV4();
        const folderUpdated = await db.addFolderShareId(Number(folderid), shareid)
    }    

    console.log(`share/${shareid}`)

    res.send(`/share/${shareid}`)
})

const getSharedFolder = asyncHandler(async (req, res)=> {
    const { shareid } = req.params
    
    if(!shareid) {
        return res.status(400).json({error: "Invalid share id"})
    }

    const sharedFolder = await db.getSharedFolder(shareid)
    if(!sharedFolder) return res.status(403).json({error: "Folder not found"})

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
    let path = await getPath(sharedFolder)

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


module.exports = {
    mainPage, 
    createFolder, 
    appearFolderContent,
    createNestedFolder, 
    deleteFolder, 
    generateShareLink, 
    getSharedFolder
}