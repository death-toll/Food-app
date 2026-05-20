# ================================
# Stage 1: Build the Spring Boot Application
# ================================

# Use Maven with Java 21 to build the project
FROM maven:3.9.6-eclipse-temurin-21 AS build

# Set working directory inside container
WORKDIR /app

# Copy Maven configuration file
COPY pom.xml .

# Copy source code
COPY src ./src

# Build the project and create executable JAR
# -DskipTests skips test execution for faster build
RUN mvn clean package -DskipTests

# ================================
# Stage 2: Run the Application
# ================================

# Use lightweight Java Runtime image
FROM eclipse-temurin:21-jre-alpine

# Set working directory
WORKDIR /app

# Copy generated JAR file from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose backend port
EXPOSE 8083

# Start Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]