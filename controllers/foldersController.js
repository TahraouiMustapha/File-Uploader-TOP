const db = require("../db/queries")
const asyncHandler = require('express-async-handler')
const { compareAsc } = require("date-fns")


const mainPage = asyncHandler (async (req, res)=> {
    const {user} = req;

    let files = null
    if(user) {
        files = await db.getUserFiles(user.userid)
        files.sort((a, b)=> compareAsc(a.createdDate, b.createdDate));
    }

    res.render("main", {
        userFiles: files?.length == 0 ? null : files , 
        newFolderHref: '/folders/new-folder' , 
    })
})

const createFolder = asyncHandler( async (req, res) => {
    let { folderName } = req.body;
    const { userid } = req.user;


    if (folderName.trim() == '') folderName = 'New Folder';

    await db.createFolder(folderName, userid)

    res.redirect(req.get('referer') || '/')
})


// folder obj
// {
//   folderid: 1,
//   name: 'new one',
//   size: null,
//   createdDate: 2025-08-20T22:03:32.379Z,
//   userid: 1,
//   parentid: null,
//   children: []
// }

const appearFolderContent = asyncHandler(async (req, res)=> {
    const { userid } = req.user;
    const { folderid } = req.params;
    
    const folderObj = await db.getFolderFiles(Number(folderid))
    const href = `/folders/${folderObj.folderid}/new-folder`;

    res.render("main" , {
        rootFolder: folderObj, 
        userFiles: folderObj?.children.length == 0 ? null : folderObj.children, 
        newFolderHref: href
    })
})

const createNestedFolder = asyncHandler(async (req, res)=> {
    const { folderid } = req.params;
    const { userid } = req.user;
    const { folderName } = req.body;

    await db.createNestedFolder(Number(folderid), Number(userid), folderName);

    res.redirect(req.get('referer') || '/')
})


module.exports = {
    mainPage, 
    createFolder, 
    appearFolderContent,
    createNestedFolder
}