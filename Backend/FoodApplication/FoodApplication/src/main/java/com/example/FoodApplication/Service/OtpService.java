package com.example.FoodApplication.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    public static final String OTP_TYPE_LOGIN = "LOGIN";
    public static final String OTP_TYPE_PASSWORD_RESET = "PASSWORD_RESET";
    public static final String OTP_TYPE_REGISTRATION = "REGISTRATION";

    // In-memory storage for OTPs (use Redis in production for scalability)
    private final Map<String, OtpData> otpStorage = new ConcurrentHashMap<>();
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.otp.expiration-seconds:300}")
    private long otpExpirationSeconds;

    /**
     * Generate a 6-digit OTP and store it in memory with expiration
     */
    public String generateOtp(String email, String otpType) {
        // Generate 6-digit OTP
        String otp = String.format("%06d", secureRandom.nextInt(1000000));

        // Create key: {type}:{email} so a user can have separate OTPs for registration/login/reset.
        String key = buildKey(email, otpType);

        // Store OTP with expiration time (in-memory).
        LocalDateTime expiryTime = LocalDateTime.now().plusSeconds(otpExpirationSeconds);
        otpStorage.put(key, new OtpData(otp, expiryTime));

        // Clean up expired OTPs periodically
        cleanupExpiredOtps();

        return otp;
    }

    /**
     * Validate OTP from memory
     */
    public boolean validateOtp(String email, String otp, String otpType) {
        String key = buildKey(email, otpType);
        OtpData storedOtp = otpStorage.get(key);

        // Valid only when:
        // - a record exists
        // - it is not expired
        // - it matches exactly
        if (storedOtp != null && !storedOtp.isExpired() && storedOtp.otp().equals(otp)) {
            return true;
        }

        return false;
    }

    /**
     * Mark OTP as used by removing it from storage
     */
    public void markOtpAsUsed(String email, String otpType) {
        String key = buildKey(email, otpType);
        otpStorage.remove(key);
    }

    /**
     * Delete any existing OTP for email and type
     */
    public void deleteOtp(String email, String otpType) {
        String key = buildKey(email, otpType);
        otpStorage.remove(key);
    }

    private String buildKey(String email, String otpType) {
        return otpType + ":" + email.toLowerCase();
    }

    private void cleanupExpiredOtps() {
        otpStorage.entrySet().removeIf(entry -> entry.getValue().isExpired());
    }

    // Inner record class to hold OTP data with expiry
    private record OtpData(String otp, LocalDateTime expiryTime) {
        boolean isExpired() {
            return LocalDateTime.now().isAfter(expiryTime);
        }
    }
}
