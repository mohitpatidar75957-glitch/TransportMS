# Single stage: Build only the Spring Boot Backend
# Frontend static files are pre-built and committed in backend/src/main/resources/static/
FROM maven:3.9.6-eclipse-temurin-21 AS backend-build
ENV MAVEN_OPTS="-Xmx300m"
WORKDIR /app/backend
COPY backend/pom.xml ./
RUN mvn dependency:go-offline -B
COPY backend/src ./src

# Verify static files are present
RUN echo "=== STATIC FILES ===" && ls -la src/main/resources/static/ && ls -la src/main/resources/static/assets/

# Package the application (frontend already in src/main/resources/static/)
RUN mvn package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=backend-build /app/backend/target/backend-0.0.1-SNAPSHOT.jar ./app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
