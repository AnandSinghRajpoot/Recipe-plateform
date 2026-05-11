package com.recipeplatform.service;

import com.recipeplatform.domain.User;
import com.recipeplatform.dto.ContactRequest;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@recipehub.com}")
    private String fromEmail;

    @Value("${app.system-email:admin@recipehub.com}")
    private String systemEmail;

    private static final String BASE_URL = "http://localhost:5173";

    public void sendWelcomeEmail(User user) {
        try {
            String role = user.getRole() != null ? user.getRole().name() : "USER";
            boolean isChef = "CHEF".equals(role);
            
            String subject = isChef ? "Welcome to RecipeHub - Setup Your Chef Profile" : "Welcome to RecipeHub - Let's Get Started";
            String ctaButton = isChef ? "Setup Your Chef Profile" : "Complete Your Profile";
            String ctaUrl = isChef ? BASE_URL + "/signup?role=chef" : BASE_URL + "/profile/complete";
            String name = user.getName() != null ? user.getName() : "Friend";

            String htmlContent = buildWelcomeEmailHtml(name, ctaButton, ctaUrl, isChef);
            sendHtmlEmail(user.getEmail(), subject, htmlContent);
        } catch (Exception e) {
            System.err.println("Failed to send welcome email: " + e.getMessage());
        }
    }

    public void sendPasswordResetEmail(User user, String resetToken) {
        try {
            String resetUrl = BASE_URL + "/reset-password?token=" + resetToken;
            String name = user.getName() != null ? user.getName() : "Friend";
            String htmlContent = buildPasswordResetEmailHtml(name, resetUrl);
            sendHtmlEmail(user.getEmail(), "Reset Your Password - RecipeHub", htmlContent);
        } catch (Exception e) {
            System.err.println("Failed to send password reset email: " + e.getMessage());
        }
    }

    public void sendContactMessageEmail(ContactRequest request) {
        try {
            String subject = "New Contact Message from " + request.getName();
            String htmlContent = buildContactEmailHtml(request);
            sendHtmlEmail(systemEmail, subject, htmlContent);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email: " + e.getMessage());
        }
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        
        mailSender.send(message);
    }

    private String buildWelcomeEmailHtml(String name, String ctaButton, String ctaUrl, boolean isChef) {
        String tagline = isChef ? "Share your culinary expertise with thousands of food enthusiasts" : "Discover healthy recipes tailored to your lifestyle";
        
        return "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"></head><body style=\"margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f5f5f5;\">" +
            "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background-color:#f5f5f5;\"><tr><td align=\"center\" style=\"padding:40px 20px;\">" +
            "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);\">" +
            "<tr><td style=\"background:linear-gradient(135deg,#22c55e,#16a34a);padding:32px;text-align:center;\">" +
            "<span style=\"font-size:32px;\">🥗</span><br><span style=\"font-size:28px;font-weight:bold;color:#ffffff;\">RecipeHub</span></td></tr>" +
            "<tr><td style=\"padding:48px 40px;\">" +
            "<h1 style=\"margin:0 0 16px;font-size:28px;font-weight:600;color:#1f2937;\">Hi " + name + "! 👋</h1>" +
            "<p style=\"margin:0 0 24px;font-size:16px;line-height:1.6;color:#4b5563;\">Welcome to RecipeHub!</p>" +
            "<p style=\"margin:0 0 32px;font-size:16px;line-height:1.6;color:#4b5563;\">" + tagline + "</p>" +
            "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\"><tr><td align=\"center\">" +
            "<a href=\"" + ctaUrl + "\" style=\"display:inline-block;background:linear-gradient(135deg,#22c55e,#16a34a);color:#ffffff;text-decoration:none;padding:16px 32px;border-radius:12px;font-weight:600;font-size:16px;\">" + ctaButton + "</a>" +
            "</td></tr></table></td></tr>" +
            "<tr><td style=\"background-color:#f9fafb;padding:24px 40px;border-top:1px solid #e5e7eb;text-align:center;\">" +
            "<p style=\"margin:0;font-size:12px;color:#6b7280;\">Need help? Contact support@recipehub.com</p>" +
            "<p style=\"margin:0;font-size:12px;color:#9ca3af;\">RecipeHub - Your Smart Nutrition Platform</p></td></tr></table></td></tr></table></body></html>";
    }

    private String buildPasswordResetEmailHtml(String name, String resetUrl) {
        return "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"></head><body style=\"margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f5f5f5;\">" +
            "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background-color:#f5f5f5;\"><tr><td align=\"center\" style=\"padding:40px 20px;\">" +
            "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);\">" +
            "<tr><td style=\"background:linear-gradient(135deg,#22c55e,#16a34a);padding:32px;text-align:center;\">" +
            "<span style=\"font-size:32px;\">🔐</span><br><span style=\"font-size:28px;font-weight:bold;color:#ffffff;\">Reset Password</span></td></tr>" +
            "<tr><td style=\"padding:48px 40px;\">" +
            "<h1 style=\"margin:0 0 16px;font-size:24px;font-weight:600;color:#1f2937;\">Hi " + name + "!</h1>" +
            "<p style=\"margin:0 0 16px;font-size:16px;line-height:1.6;color:#4b5563;\">We received a request to reset your password. Click the button below:</p>" +
            "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\"><tr><td align=\"center\">" +
            "<a href=\"" + resetUrl + "\" style=\"display:inline-block;background:linear-gradient(135deg,#22c55e,#16a34a);color:#ffffff;text-decoration:none;padding:16px 32px;border-radius:12px;font-weight:600;font-size:16px;\">Reset Password</a>" +
            "</td></tr></table>" +
            "<p style=\"margin:24px 0 0;font-size:14px;color:#9ca3af;\">This link expires in 15 minutes.</p>" +
            "<div style=\"margin-top:24px;padding:16px;background-color:#fef3c7;border-radius:8px;border-left:4px solid #f59e0b;\">" +
            "<p style=\"margin:0;font-size:14px;color:#92400e;\"><strong>Security notice:</strong> If you didn't request this, ignore this email.</p></div></td></tr>" +
            "<tr><td style=\"background-color:#f9fafb;padding:24px 40px;border-top:1px solid #e5e7eb;text-align:center;\">" +
            "<p style=\"margin:0;font-size:12px;color:#6b7280;\">Need help? Contact support@recipehub.com</p>" +
            "<p style=\"margin:0;font-size:12px;color:#9ca3af;\">RecipeHub - Your Smart Nutrition Platform</p></td></tr></table></td></tr></table></body></html>";
    }

    private String buildContactEmailHtml(ContactRequest request) {
        return "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"></head><body style=\"margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f5f5f5;\">" +
            "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background-color:#f5f5f5;\"><tr><td align=\"center\" style=\"padding:40px 20px;\">" +
            "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);\">" +
            "<tr><td style=\"background:linear-gradient(135deg,#22c55e,#16a34a);padding:32px;text-align:center;\">" +
            "<span style=\"font-size:32px;\">✉️</span><br><span style=\"font-size:28px;font-weight:bold;color:#ffffff;\">New Message</span></td></tr>" +
            "<tr><td style=\"padding:48px 40px;\">" +
            "<h2 style=\"margin:0 0 24px;font-size:20px;font-weight:600;color:#1f2937;border-bottom:2px solid #f3f4f6;padding-bottom:12px;\">Contact Details</h2>" +
            "<table width=\"100%\" style=\"margin-bottom:32px;\">" +
            "<tr><td style=\"padding:8px 0;color:#6b7280;width:120px;font-size:14px;font-weight:600;text-transform:uppercase;\">Name:</td><td style=\"padding:8px 0;color:#1f2937;font-weight:bold;\">" + request.getName() + "</td></tr>" +
            "<tr><td style=\"padding:8px 0;color:#6b7280;font-size:14px;font-weight:600;text-transform:uppercase;\">Email:</td><td style=\"padding:8px 0;color:#1f2937;font-weight:bold;\">" + request.getEmail() + "</td></tr>" +
            "<tr><td style=\"padding:8px 0;color:#6b7280;font-size:14px;font-weight:600;text-transform:uppercase;\">Address:</td><td style=\"padding:8px 0;color:#1f2937;font-weight:bold;\">" + (request.getAddress() != null ? request.getAddress() : "Not provided") + "</td></tr>" +
            "</table>" +
            "<h2 style=\"margin:0 0 16px;font-size:20px;font-weight:600;color:#1f2937;border-bottom:2px solid #f3f4f6;padding-bottom:12px;\">Message Content</h2>" +
            "<div style=\"padding:24px;background-color:#f9fafb;border-radius:12px;color:#4b5563;line-height:1.6;font-style:italic;\">\"" + request.getMessage() + "\"</div>" +
            "</td></tr>" +
            "<tr><td style=\"background-color:#f3f4f6;padding:24px 40px;text-align:center;\">" +
            "<p style=\"margin:0;font-size:12px;color:#9ca3af;\">This message was sent via the RecipeHub Contact Form.</p></td></tr></table></td></tr></table></body></html>";
    }
}