package com.example.FoodApplication.Security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * JWT helper service.
 *
 * <p>Generates and validates JWT tokens used by the API. The token is signed using an HMAC secret
 * configured via {@code app.jwt.secret} and expires after {@code app.jwt.expiration-seconds}.</p>
 *
 * <p>Tokens include (at minimum) the username/email as subject and may include a {@code role}
 * claim (e.g. {@code ROLE_OWNER}).</p>
 */
@Service
public class JwtService {

    private final SecretKey key;
    private final long expirationSeconds;

    public JwtService(
            @Value("${app.jwt.secret:please-change-this-secret-to-a-long-random-value-please-change-this}") String secret,
            @Value("${app.jwt.expiration-seconds:8640000}") long expirationSeconds
    ) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationSeconds = expirationSeconds;
    }

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        // Take the first granted authority (if present) and store it as a simple "role" claim.
        // This keeps the token small and matches our security model (single role per user).
        userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(java.util.Objects::nonNull)
                .findFirst()
                .ifPresent(r -> claims.put("role", r));

        Instant now = Instant.now();
        // Standard JWT fields:
        // - subject: the username/email
        // - issuedAt/expiration: for session validity
        // - signWith: HMAC-SHA256 using app.jwt.secret
        return Jwts.builder()
                .claims(claims)
                .subject(userDetails.getUsername())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(expirationSeconds)))
                .signWith(key, Jwts.SIG.HS256)
                .compact();
    }

    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        // Token is valid if:
        // 1) subject matches current user
        // 2) token is not expired
        String username = extractUsername(token);
        return username != null && username.equalsIgnoreCase(userDetails.getUsername()) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        Date exp = extractAllClaims(token).getExpiration();
        return exp != null && exp.before(new Date());
    }

    private Claims extractAllClaims(String token) {
        // Parse and verify the signature before extracting claims.
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}

