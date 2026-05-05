# ---- Build stage ----
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml ./
COPY src ./src

# Build a runnable jar
RUN mvn -q -DskipTests package

# ---- Runtime stage ----
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copy the built jar
COPY --from=build /app/target/*.jar ./app.jar

EXPOSE 8083

# Allow overriding port via env
ENV SERVER_PORT=8083

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
