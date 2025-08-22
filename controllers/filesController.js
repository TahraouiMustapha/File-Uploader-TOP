const db = require("../db/queries")
const asyncHandler = require('express-async-handler')
const { compareAsc } = require("date-fns")


const mainPage = asyncHandler (async (req, res)=> {
    const {user} = req;

    let files = null;
    if(user) {
        files = await db.getUserFiles(user.userid)
        files.sort((a, b)=> compareAsc(a.createdDate, b.createdDate));
    }

    res.render("main", {
        userFiles: files  
    })
})

const createFolder = asyncHandler( async (req, res) => {
    let { folderName } = req.body;
    const { userid } = req.user;


    if (folderName.trim() == '') folderName = 'New Folder';

    await db.createFolder(folderName, userid)

    res.redirect(req.get('referer') || '/')
})


module.exports = {
    mainPage, 
    createFolder
}