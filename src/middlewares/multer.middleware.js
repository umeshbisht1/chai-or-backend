import multer from "multer"
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  
 export  const upload = multer(
    { 
    storage: storage
    }
    )


    /*
   Certainly! Let me explain the key parts of the Multer example with comments to make it clear:

javascript
Copy code
import multer from "multer";

// Set up Multer to handle file uploads
const storage = multer.diskStorage({
  // Specify the destination directory for uploaded files
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  // Specify the filename for the uploaded file
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

// Export the configured Multer middleware
export const upload = multer({ storage: storage });
import multer from "multer";: Import the multer library using ES6 module syntax.

const storage = multer.diskStorage({ ... }): Configure the storage engine for Multer. In this case, it's using diskStorage, which allows you to define where to store the uploaded files.

destination: function (req, file, cb) { ... }: This function is called to determine the destination directory for storing the uploaded files. The cb (callback) function is provided by Multer. It takes two parameters: error and the destination path. In this example, cb(null, "./public/temp"); specifies that the files should be stored in the "./public/temp" directory.

filename: function (req, file, cb) { ... }: This function is called to determine the filename of the uploaded file. Similarly, the cb function is used to signal the filename. cb(null, file.originalname); specifies that the original filename should be used. You can customize this function to generate filenames dynamically.

export const upload = multer({ storage: storage });: Export the configured Multer middleware. This middleware can be used in your routes to handle file uploads.

Here's a brief overview of how this Multer configuration works:

When a file is uploaded, Multer uses the specified destination function to determine where to store the file.
It uses the filename function to determine what to name the file. In this case, it uses the original filename.
The upload middleware, configured with the specified storage settings, can be used in your routes to handle file uploads. For example, you might use upload.single('file') in a route to handle a single file upload.

    */