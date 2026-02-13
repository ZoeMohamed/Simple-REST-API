// Application bootstrap: configure global middleware, Swagger, and start the HTTP server.

import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Global API prefix
  const globalPrefix = "api";
  app.setGlobalPrefix(globalPrefix);

  // Global validation to enforce DTO rules on every request
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger UI is enabled only when SWAGGER_ENABLED=true.
  if (process.env.SWAGGER_ENABLED === "true") {
    const config = new DocumentBuilder()
      .setTitle("Simple REST API")
      .setDescription("API documentation for Users, Auth, and Posts")
      .setVersion("1.0.0")
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config, {
      ignoreGlobalPrefix: false,
    });
    SwaggerModule.setup(`${globalPrefix}/docs`, app, document);
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(
    `Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}
bootstrap();
