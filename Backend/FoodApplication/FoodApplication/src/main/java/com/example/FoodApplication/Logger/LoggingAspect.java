package com.example.FoodApplication.Logger;



import org.aspectj.lang.annotation.After;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import org.aspectj.lang.JoinPoint;

import org.aspectj.lang.annotation.Before;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;




@Aspect
@Component
public class LoggingAspect {

    public static final Logger LOGGER=LoggerFactory.getLogger(LoggingAspect.class);




    // Only log controller/service calls (avoid filters and other infrastructure beans)
    @Before("execution(* com.example.FoodApplication.Controller..*(..)) || execution(* com.example.FoodApplication.Service..*(..))")
    public void logMethodCall(JoinPoint jp) {
        LOGGER.info("Method Called {}", jp.getSignature().getName());
    }
    @After("execution(* com.example.FoodApplication.Controller..*(..)) || execution(* com.example.FoodApplication.Service..*(..))")
    public void logMethodCalled(JoinPoint jp) {
        LOGGER.info("Method  {} is executed", jp.getSignature().getName());
    }
}
