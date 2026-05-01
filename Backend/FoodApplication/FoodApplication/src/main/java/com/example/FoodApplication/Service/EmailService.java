package com.example.FoodApplication.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendRegistrationOtpEmail(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Verify Your Email - Food Application");
        message.setText(
            "Hello,\n\n" +
            "Thank you for registering with Food Application!\n\n" +
            "Your verification OTP is: " + otp + "\n\n" +
            "This OTP is valid for 5 minutes.\n\n" +
            "Please enter this OTP to complete your registration.\n\n" +
            "If you did not create an account, please ignore this email.\n\n" +
            "Regards,\nFood Application Team"
        );

        mailSender.send(message);
    }

    public void sendLoginOtpEmail(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Login OTP - Food Application");
        message.setText(
            "Hello,\n\n" +
            "Your login OTP is: " + otp + "\n\n" +
            "This OTP is valid for 5 minutes.\n\n" +
            "If you did not request this, please secure your account immediately.\n\n" +
            "Regards,\nFood Application Team"
        );

        mailSender.send(message);
    }

    public void sendPasswordResetOtpEmail(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Password Reset OTP - Food Application");
        message.setText(
            "Hello,\n\n" +
            "You have requested to reset your password.\n\n" +
            "Your OTP is: " + otp + "\n\n" +
            "This OTP is valid for 5 minutes.\n\n" +
            "If you did not request this, please ignore this email.\n\n" +
            "Regards,\nFood Application Team"
        );

        mailSender.send(message);
    }

    public void sendWelcomeEmail(String toEmail, String name) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Welcome to Food Application!");
        message.setText(
            "Hello " + name + ",\n\n" +
            "Welcome to Food Application!\n\n" +
            "Your account has been created and verified successfully.\n\n" +
            "You can now login and start ordering delicious food!\n\n" +
            "Regards,\nFood Application Team"
        );

        mailSender.send(message);
    }

    public void sendPasswordChangedEmail(String toEmail) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Password Changed - Food Application");
        message.setText(
            "Hello,\n\n" +
            "Your password has been changed successfully.\n\n" +
            "If you did not make this change, please contact support immediately.\n\n" +
            "Regards,\nFood Application Team"
        );

        mailSender.send(message);
    }
}
