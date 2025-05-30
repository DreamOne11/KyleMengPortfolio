package com.kylemeng.portfolio;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @GetMapping("/")
    public String hello() {
        return "Hello! Kyle Meng's Portfolio Backend is running successfully! 🎉";
    }
    
    @GetMapping("/api/health")
    public String health() {
        return "OK";
    }
} 