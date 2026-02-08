import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config()


const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("Transporter verification failed:", error);
  } else {
    console.log("Transporter is ready to send emails");
  }
});




export const sendEmail = async (to, subject, html) => {
  console.log("Sending email to:", to);
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    console.log("Email sent successfully:", info.response);
    return info;
  } catch (error) {
    console.error("Email send error:", error);
    throw error;
  }
};

export const sendWelcomeEmail = async (user) => {
  const html = `
    <h1>Welcome, ${user.firstName}!</h1>
    <p>Thank you for joining our platform.</p>
    <p>Start exploring job opportunities and connecting with professionals today.</p>
  `
  return sendEmail(user.email, "Welcome to Interview Platform", html)
}

export const sendInterviewScheduledEmail = async (user, interview) => {
  const html = `
    <h1>Interview Scheduled</h1>
    <p>Dear ${user.firstName},</p>
    <p>Your interview for the position has been scheduled.</p>
    <p><strong>Date:</strong> ${interview.scheduledDate}</p>
    <p><strong>Duration:</strong> ${interview.duration} minutes</p>
    ${interview.meetingLink ? `<p><a href="${interview.meetingLink}">Join Interview</a></p>` : ""}
  `
  return sendEmail(user.email, "Interview Scheduled", html)
}

export const sendApplicationStatusEmail = async (user, application, status) => {
  if (!user.email) {
    console.warn(`User ${user.id} has no email!`);
    return;
  }

  let subject = "Application Status Update";
  let message = `<p>Dear ${user.firstName || user.fullName},</p>`;

  switch (status) {
    case "applied":
      subject = "Application Received";
      message += `<p>Thank you for applying for <strong>${application.job.title}</strong>.</p>`;
      break;
    case "screening":
      subject = "Application Under Review";
      message += `<p>Your application for <strong>${application.job.title}</strong> is under review.</p>`;
      break;
    case "interview":
      subject = "Interview Scheduled";
      message += `<p>Good news! You have been shortlisted for an interview for <strong>${application.job.title}</strong>.</p>`;
      if (application.interviewScheduledAt) {
        message += `<p><strong>Interview Date:</strong> ${new Date(application.interviewScheduledAt).toLocaleString("en-US", { timeZone: "Asia/Phnom_Penh" })}</p>`;
      }
      break;
    case "decision":
      subject = application.rejectionReason ? "Application Rejected" : "Application Decision";
      message += application.rejectionReason
        ? `<p>We regret to inform you that your application for <strong>${application.job.title}</strong> was not successful.</p>
           <p><strong>Reason:</strong> ${application.rejectionReason}</p>`
        : `<p>Your application for <strong>${application.job.title}</strong> has been reviewed. Please check your dashboard for details.</p>`;
      break;
    default:
      message += `<p>Your application status has been updated to <strong>${status}</strong>.</p>`;
  }

  message += `<p>Kind regards,<br/>Human Resources Department</p>`;

  return sendEmail(user.email, subject, message);
};


// Send notification after submit application 

export const sendApplicationReceivedEmail = async ({
  applicant,
  positionTitle,
  companyName,
}) => {
  const html = `
    <p>Dear ${applicant.fullName},</p>

    <p>
      Thank you for submitting your application for the
      <strong>${positionTitle}</strong> position at
      <strong>${companyName}</strong>.
    </p>

    <p>
      We confirm that we have received your application and our recruitment
      team will review it carefully. If your qualifications match our
      requirements, we will contact you regarding the next steps in the
      recruitment process.
    </p>

    <p>
      We appreciate your interest in ${companyName} and thank you for
      considering us as a potential employer.
    </p>

    <p>
      Kind regards,<br/>
      <strong>Human Resources Department</strong><br/>
      ${companyName}
    </p>
  `

  return sendEmail(
    applicant.email,
    `Application Received – ${positionTitle}`,
    html
  )
}

export const sendInterviewStatusUpdateEmail = async (user, interview) => {
  const html = `
    <h1>Interview Status Updated</h1>
    <p>Dear ${user.firstName},</p>
    <p>The status of your interview for <strong>${interview.title}</strong> has been updated to <strong>${interview.status}</strong>.</p>
    ${interview.notes ? `<p>Notes: ${interview.notes}</p>` : ""}
    <p>Thank you for using Interview Platform.</p>
    <p>Kind regards,<br/>
    Human Resources Department</p>
  `;
  return sendEmail(user.email, "Interview Status Update", html);
};
