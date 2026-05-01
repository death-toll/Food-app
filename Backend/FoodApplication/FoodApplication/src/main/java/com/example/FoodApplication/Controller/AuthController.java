package com.example.FoodApplication.Controller;

import com.example.FoodApplication.Dto.Auth.*;
import com.example.FoodApplication.Entity.User;
import com.example.FoodApplication.Repository.UserRepo;
import com.example.FoodApplication.Security.JwtService;
import com.example.FoodApplication.Service.EmailService;
import com.example.FoodApplication.Service.OtpService;
import com.example.FoodApplication.enums.Roles;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    // Temporary storage for pending registrations (before OTP verification)
    private final Map<String, PendingRegistration> pendingRegistrations = new ConcurrentHashMap<>();

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;
    private final EmailService emailService;

    public AuthController(
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            UserDetailsService userDetailsService,
            UserRepo userRepo,
            PasswordEncoder passwordEncoder,
            OtpService otpService,
            EmailService emailService
    ) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.otpService = otpService;
        this.emailService = emailService;
    }

    // ==================== TWO-STEP REGISTRATION (with OTP email verification) ====================

    /**
     * Step 1: Initiate registration - validates data and sends OTP to email
     */
    @PostMapping("/register")
    public MessageResponse register(@Valid @RequestBody AuthRegisterRequest request) {
        // Check if email already registered
        if (userRepo.findByEmail(request.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }

        // Store pending registration data temporarily
        PendingRegistration pending = new PendingRegistration(
                request.getAge(),
                request.getName(),
                request.getStreet(),
                request.getCity(),
                request.getState(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getRole() != null ? request.getRole() : Roles.CUSTOMER
        );
        pendingRegistrations.put(request.getEmail().toLowerCase(), pending);

        // Generate OTP and send to email
        String otp;
        try {
            otp = otpService.generateOtp(request.getEmail(), OtpService.OTP_TYPE_REGISTRATION);
        } catch (Exception e) {
            log.error("Failed to generate registration OTP: {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "OTP service unavailable. Please try again.");
        }

        try {
            emailService.sendRegistrationOtpEmail(request.getEmail(), otp);
        } catch (Exception e) {
            log.error("Failed to send registration OTP to {}: {}", request.getEmail(), e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Email service unavailable. Please try again.");
        }

        return new MessageResponse("OTP sent to your email. Please verify to complete registration.");
    }

    /**
     * Step 2: Verify OTP and complete registration
     */
    @PostMapping("/register/verify-otp")
    @ResponseStatus(HttpStatus.CREATED)
    public MeResponse verifyRegistrationOtp(@Valid @RequestBody VerifyOtpRequest request) {
        // Validate OTP
        boolean isValid;
        try {
            isValid = otpService.validateOtp(request.getEmail(), request.getOtp(), OtpService.OTP_TYPE_REGISTRATION);
        } catch (Exception e) {
            log.error("Failed to validate registration OTP: {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "OTP service unavailable. Please try again.");
        }

        if (!isValid) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired OTP");
        }

        // Get pending registration
        PendingRegistration pending = pendingRegistrations.get(request.getEmail().toLowerCase());
        if (pending == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Registration session expired. Please register again.");
        }

        // Check again if email was registered in the meantime
        if (userRepo.findByEmail(request.getEmail()).isPresent()) {
            pendingRegistrations.remove(request.getEmail().toLowerCase());
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }

        // Create user
        User user = new User();
        user.setAge(pending.age());
        user.setName(pending.name());
        user.setStreet(pending.street());
        user.setCity(pending.city());
        user.setState(pending.state());
        user.setEmail(pending.email());
        user.setPassword(pending.encodedPassword());
        user.setRole(pending.role());

        User saved = userRepo.save(user);

        // Cleanup
        pendingRegistrations.remove(request.getEmail().toLowerCase());
        otpService.markOtpAsUsed(request.getEmail(), OtpService.OTP_TYPE_REGISTRATION);

        // Send welcome email
        try {
            emailService.sendWelcomeEmail(saved.getEmail(), saved.getName());
        } catch (Exception e) {
            log.warn("Failed to send welcome email to {}: {}", saved.getEmail(), e.getMessage());
        }

        return new MeResponse(saved.getUser_id(), saved.getEmail(), saved.getName(), saved.getRole());
    }

    /**
     * Resend registration OTP
     */
    @PostMapping("/register/resend-otp")
    public MessageResponse resendRegistrationOtp(@Valid @RequestBody ForgotPasswordRequest request) {
        // Check if there's a pending registration
        PendingRegistration pending = pendingRegistrations.get(request.getEmail().toLowerCase());
        if (pending == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No pending registration found. Please register again.");
        }

        // Generate new OTP
        String otp;
        try {
            otp = otpService.generateOtp(request.getEmail(), OtpService.OTP_TYPE_REGISTRATION);
        } catch (Exception e) {
            log.error("Failed to generate registration OTP: {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "OTP service unavailable. Please try again.");
        }

        try {
            emailService.sendRegistrationOtpEmail(request.getEmail(), otp);
        } catch (Exception e) {
            log.error("Failed to resend registration OTP to {}: {}", request.getEmail(), e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Email service unavailable. Please try again.");
        }

        return new MessageResponse("OTP resent to your email.");
    }

    // ==================== SIMPLE LOGIN (email + password only) ====================

    /**
     * Login with email and password - returns JWT token directly
     */
    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody AuthLoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        String token = jwtService.generateToken(userDetails);

        return new AuthResponse(token, "Bearer");
    }

    // ==================== GET CURRENT USER ====================

    @GetMapping("/me")
    public MeResponse me() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetails principal)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }

        User user = userRepo.findByEmail(principal.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated"));

        return new MeResponse(user.getUser_id(), user.getEmail(), user.getName(), user.getRole());
    }

    // ==================== FORGOT PASSWORD FLOW ====================

    /**
     * Step 1: Request OTP for password reset
     */
    @PostMapping("/forgot-password")
    public MessageResponse forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        User user = userRepo.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Email not registered"));

        String otp;
        try {
            otp = otpService.generateOtp(request.getEmail(), OtpService.OTP_TYPE_PASSWORD_RESET);
        } catch (Exception e) {
            log.error("Failed to generate password reset OTP: {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "OTP service unavailable. Please try again.");
        }

        try {
            emailService.sendPasswordResetOtpEmail(request.getEmail(), otp);
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", request.getEmail(), e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Email service unavailable. Please try again.");
        }

        return new MessageResponse("OTP sent to your email address");
    }

    /**
     * Step 2: Verify password reset OTP
     */
    @PostMapping("/forgot-password/verify-otp")
    public MessageResponse verifyForgotPasswordOtp(@Valid @RequestBody VerifyOtpRequest request) {
        boolean isValid;
        try {
            isValid = otpService.validateOtp(request.getEmail(), request.getOtp(), OtpService.OTP_TYPE_PASSWORD_RESET);
        } catch (Exception e) {
            log.error("Failed to validate password reset OTP: {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "OTP service unavailable. Please try again.");
        }

        if (!isValid) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired OTP");
        }

        return new MessageResponse("OTP verified successfully");
    }

    /**
     * Step 3: Reset password with OTP
     */
    @PostMapping("/reset-password")
    public MessageResponse resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        boolean isValid;
        try {
            isValid = otpService.validateOtp(request.getEmail(), request.getOtp(), OtpService.OTP_TYPE_PASSWORD_RESET);
        } catch (Exception e) {
            log.error("Failed to validate password reset OTP: {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "OTP service unavailable. Please try again.");
        }

        if (!isValid) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired OTP");
        }

        User user = userRepo.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepo.save(user);

        otpService.markOtpAsUsed(request.getEmail(), OtpService.OTP_TYPE_PASSWORD_RESET);

        try {
            emailService.sendPasswordChangedEmail(request.getEmail());
        } catch (Exception e) {
            log.warn("Failed to send password changed email to {}: {}", request.getEmail(), e.getMessage());
        }

        return new MessageResponse("Password reset successfully");
    }

    // Inner record for pending registration data
    private record PendingRegistration(
            Integer age,
            String name,
            String street,
            String city,
            String state,
            String email,
            String encodedPassword,
            Roles role
    ) {}
}
