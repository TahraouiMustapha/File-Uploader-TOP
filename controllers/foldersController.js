const db = require("../db/queries")
const asyncHandler = require('express-async-handler')
const { compareAsc } = require("date-fns");

const { getPath } = require('../services/foldersServices') 


const mainPage = asyncHandler (async (req, res)=> {
    const {user} = req;
    const { selectedFileId } = req.query

    let files = null
    if(user) {
        files = await db.getUserFiles(user.userid)
        files.sort((a, b)=> compareAsc(a.createdDate, b.createdDate));
    }

    let fileObj = null
    if(selectedFileId) {
        fileObj = await db.getFileById(Number(selectedFileId))
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
    } 

    const path = await getPath(folderObj)

    let fileObj = null
    if(selectedFileId) {
        fileObj = await db.getFileById(Number(selectedFileId))
    }

    res.render("main" , {
        rootFolder: folderObj, 
        path: `> ${path.join(' > ')}`,
        userFiles: foldersAndFiles, 
        newFolderHref: newFolderHref, 
        newFileHref: newFileHref, 
        clickedFile: fileObj
    })
})

const createNestedFolder = asyncHandler(async (req, res)=> {
    const { folderid } = req.params;
    const { userid } = req.user;
    const { folderName } = req.body;

    await db.createNestedFolder(Number(folderid), Number(userid), folderName);

    const path = `/folders/${folderid}`
    res.redirect(path)
})


const deleteFolder = asyncHandler(async (req, res)=> {
    const { folderid } = req.params;

    const folder = await db.getFolderById(Number(folderid))

    let folderParent = null;
    if(folder.parentid) {
        folderParent = await db.getFolderById(Number(folder.parentid))
    }
    await db.deleteFolder(Number(folderid))


    folderParent ?
    res.redirect(`/folders/${folderParent.folderid}`) :
    res.redirect('/') ; 
})


module.exports = {
    mainPage, 
    createFolder, 
    appearFolderContent,
    createNestedFolder, 
    deleteFolder
}