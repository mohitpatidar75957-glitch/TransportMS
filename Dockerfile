# Single stage: Build only the Spring Boot Backend
FROM maven:3.9.6-eclipse-temurin-21 AS backend-build
ENV MAVEN_OPTS="-Xmx512m -XX:+UseG1GC"
WORKDIR /app/backend

# Copy pom and source code
COPY backend/pom.xml ./
COPY backend/src ./src

# Package the application
RUN mvn clean package -DskipTests -B

# Stage 2: Run the application
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=backend-build /app/backend/target/backend-0.0.1-SNAPSHOT.jar ./app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-Xmx400m", "-jar", "app.jar"]

