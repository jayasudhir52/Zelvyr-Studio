import { db, collection, doc } from './firebase-config.js';
import { setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

function generateProjectId() {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `ZEL-2026-${randomNum}`;
}

const form = document.getElementById('submission-form');
const submitBtn = document.getElementById('submit-btn');

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        submitBtn.disabled = true;
        submitBtn.innerText = 'Submitting...';

        const studentName = document.getElementById('studentName').value;
        const studentEmail = document.getElementById('studentEmail').value;
        const projectTitle = document.getElementById('projectTitle').value;
        const projectDetails = document.getElementById('projectDetails').value;
        
        const projectId = generateProjectId();

        try {
            // 1. Save to Firebase Firestore
            const projectRef = doc(collection(db, 'projects'), projectId);
            await setDoc(projectRef, {
                projectId: projectId,
                studentName: studentName,
                studentEmail: studentEmail,
                projectTitle: projectTitle,
                projectDetails: projectDetails,
                status: 'Received',
                progress: 0,
                createdAt: serverTimestamp(),
                estimatedCompletion: "To be decided"
            });

            // 2. Send EmailJS Notification
            // Ensure emailjs is initialized in HTML
            try {
                await emailjs.send(
                    'service_3vzq0th', 
                    'template_05z1irs', 
                    {
                        project_id: projectId,
                        student_name: studentName,
                        student_email: studentEmail,
                        project_title: projectTitle
                    }
                );
                console.log('Email sent successfully');
            } catch (emailError) {
                console.error('Failed to send email:', emailError);
                // Continue showing success even if email fails
            }

            // 3. Show Success Screen
            document.getElementById('form-container').classList.add('hidden');
            document.getElementById('success-container').classList.remove('hidden');
            document.getElementById('generated-id').innerText = projectId;

        } catch (error) {
            console.error('Error submitting project:', error);
            alert('Failed to submit project. Please try again or check Firebase configuration.');
            submitBtn.disabled = false;
            submitBtn.innerText = 'Submit Request';
        }
    });
}
