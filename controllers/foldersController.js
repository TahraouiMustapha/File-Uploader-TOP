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
        userFiles: files.length == 0 ? null : files   
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
    const { userid } = req.user;
    const { folderid } = req.params;
    
    const folderFiles = await db.getFolderFiles(userid, Number(folderid))

    console.log(folderFiles)

    res.send('hi')
})


module.exports = {
    mainPage, 
    createFolder, 
    appearFolderContent
}