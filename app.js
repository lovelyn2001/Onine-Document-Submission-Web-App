const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config();
port = process.env.PORT || 4000;
const session = require('express-session');
const flash = require('connect-flash');


// Initialize App
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Express Session Middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

// Connect Flash Middleware
app.use(flash());


// Create uploads folder if not exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));

// Multer Setup for File Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// MongoDB Schema & Models
const studentSchema = new mongoose.Schema({
    name: String,
    regnumber: String,
    department: String,
    jambregnumber: String,
    documents: [String]
});

const Student = mongoose.model('Student', studentSchema);

const staffSchema = new mongoose.Schema({
    username: String,
    password: String
});

const Staff = mongoose.model('Staff', staffSchema);

// Route: Index Page (Choose Role)
app.get('/', (req, res) => {
    res.render('index');
});

// Route: Student Registration Page
app.get('/student/register', (req, res) => {
    res.render('studentRegister');
});

// Route: Student Registration Logic
app.post('/student/register', async (req, res) => {
    try {
        const { name, regnumber, department, jambregnumber } = req.body;
        const newStudent = new Student({ name, regnumber, department, jambregnumber, documents: [] });
        await newStudent.save();
        res.redirect('/student/login');
    } catch (err) {
        console.log(err);
        res.send('Error registering student');
    }
});

// Route: Student Login Page
app.get('/student/login', (req, res) => {
    res.render('studentLogin');
});

// Route: Student Login Logic
app.post('/student/login', async (req, res) => {
    try {
        const { name, regnumber } = req.body;
        const student = await Student.findOne({ name, regnumber });
        if (student) {
            res.redirect(`/student/dashboard/${student._id}`);
        } else {
            res.send('Invalid credentials');
        }
    } catch (err) {
        console.log(err);
        res.send('Error logging in');
    }
});

// Route: Student Dashboard (File Upload Page)
app.get('/student/dashboard/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        const flashMessage = req.flash('message'); // Get flash message
        if (student) {
            res.render('studentDashboard', { student, flashMessage }); // Pass flash message to the view
        } else {
            res.send('Student not found');
        }
    } catch (err) {
        console.log(err);
        res.send('Error loading dashboard');
    }
});

// Route: Student File Upload Logic
app.post('/student/upload/:id', upload.fields([
    { name: 'waec', maxCount: 1 }, { name: 'jamb', maxCount: 1 }, { name: 'admission', maxCount: 1 },
    { name: 'post_utme', maxCount: 1 }, { name: 'acceptance_fee', maxCount: 1 }, { name: 'jamb_admission_letter', maxCount: 1 },
    { name: 'first_school_leaving', maxCount: 1 }, { name: 'school_fees', maxCount: 1 }, { name: 'sug_receipt', maxCount: 1 },
    { name: 'nacoss_receipt', maxCount: 1 }, { name: 'accommodation_fee', maxCount: 1 }, { name: 'acceptance_offer', maxCount: 1 },
    { name: 'pledge', maxCount: 1 }, { name: 'departmental_clearance', maxCount: 1 }, { name: 'provisional_clearance', maxCount: 1 },
    { name: 'birth_certificate', maxCount: 1 }, { name: 'lga_declaration', maxCount: 1 }, { name: 'attestation_letter', maxCount: 1 },
    { name: 'medical_certification', maxCount: 1 }, { name: 'matriculation_oath', maxCount: 1 }, { name: 'course_registration', maxCount: 1 },
    { name: 'biodata_form', maxCount: 1 }, { name: 'waec_verification', maxCount: 1 }
]), async (req, res) => {
    try {
        const studentId = req.params.id;
        const uploadedFiles = Object.values(req.files).flat().map(file => file.path); // Flatten and extract file paths
        await Student.findByIdAndUpdate(studentId, { $push: { documents: { $each: uploadedFiles } } }, { new: true });
        req.flash('message', 'Files uploaded successfully!'); // Set success flash message
        res.redirect(`/student/dashboard/${studentId}`);
    } catch (err) {
        console.log(err);
        req.flash('message', 'Error uploading files'); // Set error flash message
        res.redirect(`/student/dashboard/${studentId}`);
    }
});

// Route: Staff Login Page
app.get('/staff/login', (req, res) => {
    res.render('staffLogin');
});

// Route: Staff Login Logic
app.post('/staff/login', async (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'Mouau') {
        res.redirect('/staff/dashboard');
    } else {
        res.send('Invalid login');
    }
});

// Route: Staff Dashboard (View and Download Files)
app.get('/staff/dashboard', async (req, res) => {
    try {
        const students = await Student.find(); // Using async/await
        if (students) {
            // Only extract filenames for documents
            const studentsWithFilenames = students.map(student => ({
                ...student.toObject(), // Convert Mongoose document to plain JavaScript object
                documents: student.documents.map(doc => path.basename(doc)) // Get only filenames
            }));
            res.render('staffDashboard', { students: studentsWithFilenames });
        } else {
            res.send('No students found');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


// Route: Download File
app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);
    res.download(filePath, (err) => {
        if (err) {
            console.log(err);
            res.status(404).send('File not found');
        }
    });
});


// Start Server
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })