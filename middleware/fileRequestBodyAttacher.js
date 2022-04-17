const attachCover = (req, res, next) => {
    console.log(req.file);
    if(req.file != null){
        if(req.method == 'POST'){
            console.log('Is Post');
            req.body.cover = req.file.filename;
        }else if(req.method == 'PUT'){
            req.body.bookChanges.cover = req.file.filename;
        }
    }

    next();
}

const attachProfilePicture = (req, res, next) => {
    if(req.file != null){
        req.body.profile_picture = req.file.filename;
    }

    next();
}

module.exports = {
    attachCover,
    attachProfilePicture
}