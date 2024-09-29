window.onload = function() {
  const studentName = localStorage.getItem('studentName');
  if (studentName) {
    document.getElementById('welcome-message').innerText = `Welcome, ${studentName}`;
  } else {
    window.location.href = '/';
  }
};

document.getElementById('upload-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const files = document.querySelectorAll('input[type="file"]');
  const statusDiv = document.getElementById('status');
  statusDiv.innerHTML = ''; // Clear previous status messages
  let valid = true;

  const formData = new FormData(); // Create FormData object to hold the files

  files.forEach(fileInput => {
    const file = fileInput.files[0];
    if (file) {
      if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
        statusDiv.innerHTML += `<p>${fileInput.previousElementSibling.innerText}: Invalid file type! Only JPEG and PNG are allowed.</p>`;
        valid = false;
      } else if (file.size > 5 * 1024 * 1024) {
        statusDiv.innerHTML += `<p>${fileInput.previousElementSibling.innerText}: File size exceeds 5MB!</p>`;
        valid = false;
      } else {
        formData.append(fileInput.id, file); // Append file to FormData
        statusDiv.innerHTML += `<p>${fileInput.previousElementSibling.innerText}: File is valid.</p>`;
      }
    } else {
      statusDiv.innerHTML += `<p>${fileInput.previousElementSibling.innerText}: No file uploaded!</p>`;
      valid = false;
    }
  });

  if (valid) {
    // All files are valid, now send them to the server
    fetch('/upload', {
      method: 'POST',
      body: formData
    })
    .then(response => response.text())
    .then(data => {
      alert(data); // Display the server response
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }
});
