const express = require('express')
const app = express()
const { upload } = require('./config/multerConfig')
const fs = require('fs');
const path = require('path');
const port = 3000
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.post('/createBucket', async (req, res) => {
    console.log('req.body', req.body)
    const bucketName = req.body.bucketName;
    if (!bucketName) {
        return res.json({ status: false, message: "Bucket Name is Mandatory" });
    }
    const rootFolder = "S3Service";
    const folderpath = `${rootFolder}/${bucketName}`;
    try {
        if (fs.existsSync(rootFolder)) {
            if (!fs.existsSync(folderpath)) {
                fs.mkdirSync(folderpath);
                return res.json({ status: true, success: "Directory created" });
            }
        } else {
            fs.mkdirSync(rootFolder);
            if (!fs.existsSync(folderpath)) {
                fs.mkdirSync(folderpath);
                return res.json({ status: true, success: "Directory/Folder created" });
            }
        }
        return res.json({ status: true, success: "Directory/Folder Already Exist" });
    } catch (error) {
        console.log(error);
    }
});

// get Bucket List
app.get("/getAllBucket", async (req, res) => {

    const directoryPath = path.join('S3Service');

    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            console.error(err);
            return;
        }
        const directories = files.filter(file => {
            const filePath = path.join(directoryPath, file);
            return fs.statSync(filePath).isDirectory();
        });

        console.log(directories);
        return res.json({ status: true, success: directories });
    });
});

app.post("/uploadFileInBucket", upload().single("file"), async (req, res) => {
    if (req.file) {
        res.json({ status: true, success: "File Uploaded Successfully" });
    }
});

app.get("/getAllFilesFromBucket", async (req, res) => {
    try {
        const bucketName = req.query.bucketName;
        const directoryPath = path.join(`S3Service/${bucketName}`);
        fs.readdir(directoryPath, (err, files) => {
            if (err) {
                return res.json({ status: false, message: `${bucketName}, No Such Bucket Found` });
            }

            const allfiles = files.filter(file => {
                const filePath = path.join(directoryPath, file);
                return fs.statSync(filePath).isFile();
            });

            console.log(allfiles);
            return res.json({ status: true, filesList: allfiles });
        });
    } catch (error) {
        console.log("error------->>", error);
    }
});

app.get("/getOneFileFromBucket", async (req, res) => {
    const bucketName = req.query.bucketName;
    const fileName = req.query.fileName;
    // console.log('req.body', req.body)
    if (!bucketName) {
        return res.json({ status: false, message: "Folder Name is Mandatory" });
    }
    if (!fileName) {
        return res.json({ status: false, message: "File Name is Mandatory" });
    }
    const rootFolder = "S3Service";
    const folderpath = `${rootFolder}/${bucketName}/${fileName}`;
    try {
        const stream = fs.createReadStream(folderpath);
        res.setHeader('Content-type', 'application/pdf');
        stream.pipe(res);
    } catch (error) {
        return res.json({ status: false, success: error });
    }
});

// This will delete Files from a given Bucket/folder
app.post("/deleteFileBucket", async (req, res) => {
    const bucketName = req.body.bucketName;
    const fileName = req.body.fileName;
    console.log('req.body', req.body)
    if (!bucketName) {
        return res.json({ status: false, message: "Folder Name is Mandatory" });
    }
    if (!fileName) {
        return res.json({ status: false, message: "File Name is Mandatory" });
    }
    const rootFolder = "S3Service";
    const folderpath = `${rootFolder}/${bucketName}/${fileName}`;
    try {
        fs.unlink(folderpath, (err) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log('File deleted successfully');
        });
        return res.json({ status: true, success: "File deleted successfully" });
    } catch (error) {
        return res.json({ status: false, success: error });
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})