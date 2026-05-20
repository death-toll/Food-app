package com.example.FoodApplication.Controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping
    public Map<String, Object> healthCheck() {
        return Map.of(
            "status", "OK",
            "message", "Backend is running!",
            "timestamp", LocalDateTime.now().toString()
        );
    }
}
