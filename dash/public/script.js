var sname = document.getElementById("sname");
var det = document.getElementById("det");
var attend = document.getElementById("attend");
var iat1 = document.getElementById("iat1");
var iat2 = document.getElementById("iat2");
var model = document.getElementById("model");
var sem = document.getElementById("sem");
var prev = document.getElementById("prev");
var sub = document.getElementById("sub");
var sum = document.getElementById("sum");
var per = document.getElementById("per");

var regnoInput = document.getElementById("regnoInput");
var regnoInputSection = document.getElementById("regnoInputSection");
var loadingSection = document.getElementById("loading");
var dashboardSection = document.getElementById("dashboard");

async function fetchStudentAnalysis() {
    var regno = regnoInput.value.trim();
    if (!regno) {
        alert("Please enter a valid Registration Number.");
        return;
    }

    // Hide the registration input section and show the loading image
    regnoInputSection.style.display = "none";
    loadingSection.style.display = "block";

    try {
        const response = await fetch('http://localhost:3000/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ regno })
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();

        // Show the dashboard after data is fetched
        regnoInputSection.style.display = "none";
        loadingSection.style.display = "none";
        dashboardSection.style.display = "block";

        // Student Details
        sname.innerHTML = data.studentDetails.name;
        det.innerHTML = `${data.studentDetails.department}, Year: ${data.studentDetails.currentSemester - 1}, Semester: ${data.studentDetails.currentSemester}`;
        const attendancePercentage = data.attendancePercentage;

        const maxWidth = 500;

        // Calculate width based on attendance percentage
        const width = (attendancePercentage / 100) * maxWidth - 5;

        // Determine color based on attendance range
        let color;
        if (attendancePercentage >= 75) {
            color = "#043f6c";  // High attendance
        } else if (attendancePercentage >= 50) {
            color = "orange"; // Medium attendance
        } else {
            color = "red";    // Low attendance
        }

        // Update the element with dynamic width and color
        attend.style.width = `${width}px`;
        attend.style.backgroundColor = color;
        attend.style.height = `100%`;
        per.innerHTML = `Attendance: ${attendancePercentage}%`;

        function displayMarks(examData, container, isUnitTest = false) {
            container.innerHTML = ""; // Clear previous content
            let allSubjectsNA = true;  // Flag to check if all subjects are 'NA'

            const subjects = examData.subjects;

            for (let subject in subjects) {
                let mark = subjects[subject];

                if (subject !== 'NA') {
                    allSubjectsNA = false;  // Found at least one valid subject

                    let div = document.createElement("div");
                    div.style.display = "flex";
                    div.style.justifyContent = "space-between";
                    div.style.marginTop = "15px";
                    div.style.marginBottom = "5px";

                    // Subject name takes 35% width
                    let subjectDiv = document.createElement("div");
                    subjectDiv.style.width = "35%";
                    subjectDiv.innerHTML = `${subject}`;

                    // Mark (progress bar) takes 65% width
                    let markDiv = document.createElement("div");
                    markDiv.style.width = "65%";
                    markDiv.style.textAlign = "right";
                    markDiv.style.position = "relative"; // Enable positioning of the percentage inside the progress bar

                    if (isUnitTest) {
                        // Create the progress bar container
                        let progressBar = document.createElement("div");
                        progressBar.style.height = "20px";
                        progressBar.style.width = "100%";
                        progressBar.style.backgroundColor = "#ddd";
                        progressBar.style.borderRadius = "5px";

                        // Calculate the percentage and create the inner progress element
                        let percentage = (mark / 100) * 100;
                        let progress = document.createElement("div");
                        progress.style.height = "100%";
                        progress.style.width = `${percentage}%`;
                        progress.style.backgroundColor = "#043f6c";
                        progress.style.borderRadius = "5px";

                        // Create the percentage text and position it in the center
                        let percentageText = document.createElement("span");
                        percentageText.innerHTML = `${mark}%`;
                        percentageText.style.position = "absolute";
                        percentageText.style.left = "50%";
                        percentageText.style.top = "50%";
                        percentageText.style.transform = "translate(-50%, -50%)"; // Center it
                        percentageText.style.color = "white"; // Optional: makes it more readable

                        // Append the elements
                        progressBar.appendChild(progress);
                        markDiv.appendChild(percentageText);
                        markDiv.appendChild(progressBar);
                    } else {
                        markDiv.innerHTML = `${mark}`;
                    }

                    div.appendChild(subjectDiv);
                    div.appendChild(markDiv);
                    container.appendChild(div);
                }
            }

            // If all subjects are 'NA', show the "Not Yet Attended" message
            if (allSubjectsNA) {
                container.style.backgroundColor = "rgba(255, 0, 0, 0.42)";
                container.style.color = "darkred";
                container.style.padding = "10px";
                container.style.textAlign = "center";
                container.style.display = "flex";
                container.style.justifyContent = "center";
                container.style.alignItems = "center";
                container.style.borderRadius = "5px";
                container.style.height = "90%";
                container.innerHTML = `<strong>Not Yet Attended</strong>`;
            } else {
                // Reset background if data is available
                container.style.backgroundColor = "";
                container.style.color = "";
            }
        }

        // Display Marks for each exam
        displayMarks(data.iat1Data, iat1);
        displayMarks(data.iat2Data, iat2);
        displayMarks(data.modelExamData, model);
        displayMarks(data.semesterData, sem);

        // Display Unit Test marks as progress bars in the 'sub' container
        displayMarks(data.unitTestData, sub, true);

        // Previous Semester Records
        prev.innerHTML = "";
        data.prevSemData.forEach((record) => {
            let div = document.createElement("div");
            div.setAttribute("class", "sempre")
            div.innerHTML = `<br></div><div><strong>Semester ${record.semester}</strong></div><div>GPA: ${record.GPA}</div>`;
            prev.appendChild(div);

        });

        // Summary
        sum.innerHTML = data.summary;

    } catch (error) {
        console.error('Error fetching student analysis:', error);
    }
}
