const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Save files to 'uploads' folder
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Only .jpeg and .png files are allowed!'), false);
    }
  }
});

// Update to use upload.fields instead of upload.array
const uploadFields = upload.fields([
  { name: 'waec', maxCount: 1 },
  { name: 'jamb', maxCount: 1 },
  { name: 'admission', maxCount: 1 },
  { name: 'post_utme', maxCount: 1 },
  { name: 'acceptance_fee', maxCount: 1 },
  { name: 'jamb_admission_letter', maxCount: 1 },
  { name: 'first_school_leaving', maxCount: 1 },
  { name: 'school_fees', maxCount: 1 },
  { name: 'sug_receipt', maxCount: 1 },
  { name: 'nacoss_receipt', maxCount: 1 },
  { name: 'accommodation_fee', maxCount: 1 },
  { name: 'acceptance_offer', maxCount: 1 },
  { name: 'pledge', maxCount: 1 },
  { name: 'departmental_clearance', maxCount: 1 },
  { name: 'provisional_clearance', maxCount: 1 },
  { name: 'birth_certificate', maxCount: 1 },
  { name: 'lga_declaration', maxCount: 1 },
  { name: 'attestation_letter', maxCount: 1 },
  { name: 'medical_certification', maxCount: 1 },
  { name: 'matriculation_oath', maxCount: 1 },
  { name: 'course_registration', maxCount: 1 },
  { name: 'biodata_form', maxCount: 1 },
  { name: 'waec_verification', maxCount: 1 }
]);

// Endpoint for file upload
app.post('/upload', uploadFields, (req, res) => {

  // Handle any errors
  if (req.fileValidationError) {
    return res.status(400).send(req.fileValidationError);
  }
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }
  res.send('Files uploaded successfully');
});

// Serve static files from 'public' directory
app.use(express.static('public'));


const uploadDir = path.join(__dirname, 'uploads'); // Directory where files are saved

// API route to fetch uploaded documents
app.get('/api/documents', (req, res) => {
  // Read the contents of the uploads directory
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to fetch documents.' });
    }

    // Create a list of file metadata (file name, type, upload time)
    const documents = files.map(file => {
      const filePath = path.join(uploadDir, file);
      const fileStats = fs.statSync(filePath); // Get file stats for upload time

      return {
        fileName: file,
        fileType: path.extname(file), // Get file extension
        uploadedAt: fileStats.mtime.toLocaleString(), // Use the file's modification time
      };
    });

    res.json(documents); // Return the list of documents as JSON
  });
});


// Serve the HTML pages
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/Role.html');
});

app.get('/Role.html', (req, res) => {
  res.sendFile(__dirname + '/Role.html');
});

app.get('/dashboard.html', (req, res) => {
  res.sendFile(__dirname + '/dashboard.html');
});

app.get('/admin-dashboard.html', (req, res) => {
  res.sendFile(__dirname + '/admin-dashboard.html');
});

app.get('/admin-login.html', (req, res) => {
  res.sendFile(__dirname + '/admin-login.html');
});


app.get('/user.html', (req, res) => {
  res.sendFile(__dirname + '/user.html');
});


// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
