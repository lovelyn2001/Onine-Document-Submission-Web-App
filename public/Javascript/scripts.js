document.getElementById('student-form').addEventListener('submit', function (e) {
    e.preventDefault();
  
    const name = document.getElementById('name').value;
    const regNo = document.getElementById('regNo').value;
    const jambNo = document.getElementById('jambNo').value;
  
    if (name && regNo && jambNo) {
      localStorage.setItem('studentName', name);
      window.location.href = '/dashboard.html';
    }
  });
  