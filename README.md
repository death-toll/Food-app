# Food App

A full-stack food ordering and delivery application built with a Spring Boot backend and JavaScript frontend.

## 📋 Project Overview

This is a modern food delivery application featuring:
- **Backend**: Java-based REST API with Spring Boot
- **Frontend**: JavaScript-based user interface
- **Database**: PostgreSQL with Neon cloud database
- **Authentication**: OTP-based user verification with email
- **Architecture**: Microservices-ready design with Hibernate ORM

## 🛠️ Tech Stack

### Backend
- **Framework**: Spring Boot
- **Language**: Java
- **ORM**: Hibernate (JPA)
- **Database**: PostgreSQL (Neon)
- **Email Service**: Gmail SMTP
- **Port**: 8083

### Frontend
- **Language**: JavaScript
- **Styling**: CSS

## 📁 Project Structure

```
Food-app/
├── Backend/
│   └── FoodApplication/
│       └── FoodApplication/
│           ├── src/
│           │   └── main/
│           │       ├── java/
│           │       └── resources/
│           │           └── application.properties
│           └── ...
├── [Frontend files]
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Java 8 or higher
- PostgreSQL (or use Neon cloud database)
- Node.js (for frontend development)
- Maven (for building the backend)

### Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd Backend/FoodApplication/FoodApplication
   ```

2. **Configure environment variables** (optional):
   ```bash
   export SPRING_DATASOURCE_URL=jdbc:postgresql://your-host:5432/database
   export SPRING_DATASOURCE_USERNAME=your_username
   export SPRING_DATASOURCE_PASSWORD=your_password
   export SPRING_MAIL_USERNAME=your_email@gmail.com
   export SPRING_MAIL_PASSWORD=your_app_password
   ```

3. **Build the application**:
   ```bash
   mvn clean install
   ```

4. **Run the application**:
   ```bash
   mvn spring-boot:run
   ```

The application will start on `http://localhost:8083`

### Frontend Setup

1. **Navigate to the frontend directory** and install dependencies:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm start
   ```

## ⚙️ Configuration

### Database Configuration
The application uses PostgreSQL with Neon cloud database. Update `application.properties` with your database credentials:

```properties
spring.datasource.url=jdbc:postgresql://your-host:5432/your-database?sslmode=require
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### Email Configuration
Gmail SMTP is configured for sending emails (OTP, notifications, etc.):

```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your_email@gmail.com
spring.mail.password=your_app_password
```

*Note*: Use [Gmail App Passwords](https://support.google.com/accounts/answer/185833) for authentication.

### OTP Settings
- **Expiration Time**: 5 minutes (300 seconds)
- Configurable in `application.properties`: `app.otp.expiration-seconds`

### Logging
- **Log Level**: DEBUG (set to `com.example.FoodApplication`)
- **Log File**: `logs/app.log`
- **Format**: `yyyy-MM-dd HH:mm:ss`

## 📊 Language Composition
- **JavaScript**: 61.2%
- **Java**: 36.7%
- **CSS**: 1.7%
- **Other**: 0.4%

## 🔑 Key Features

- ✅ User authentication and OTP verification
- ✅ Email notifications
- ✅ PostgreSQL database with Hibernate ORM
- ✅ RESTful API architecture
- ✅ Debug logging and monitoring
- ✅ Cloud-hosted database (Neon)

## 🔐 Security Notes

⚠️ **Important**: The credentials in `application.properties` are placeholders. Never commit sensitive information (passwords, API keys) to version control.

**Best Practices**:
- Use environment variables for all sensitive data
- Use `.env` files locally (add to `.gitignore`)
- Enable SSL/TLS for database connections
- Use Gmail App Passwords instead of account passwords
- Implement proper JWT or OAuth2 for user sessions

## 📝 Database Migrations

The application uses Hibernate's automatic DDL generation:
```properties
spring.jpa.hibernate.ddl-auto=update
```

This means database tables are automatically created/updated on application startup. For production, consider using Flyway or Liquibase for version-controlled migrations.

## 🧪 Testing

To run tests:
```bash
mvn test
```

## 📦 Building for Production

```bash
mvn clean package -DskipTests
```

This will create a JAR file in the `target/` directory.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For issues and questions, please open an issue on the GitHub repository.

---

**Last Updated**: July 2026
