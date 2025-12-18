# 1. Usamos uma imagem que já tem o Maven e o Java 17 instalados
FROM maven:3.9.6-eclipse-temurin-21

# 2. Definimos a pasta de trabalho dentro do container
WORKDIR /app

# 3. Copiamos o arquivo de dependências (pom.xml) e baixamos as bibliotecas
# Isso é feito antes de copiar o código para aproveitar o cache do Docker
COPY pom.xml .
# (Opcional) Baixa dependências para cachear, se falhar não tem problema, o comando final resolve
RUN mvn dependency:go-offline -B 

# 4. Copiamos o resto do seu código fonte
COPY src ./src

# 5. Expomos a porta 8080 (padrão do Spring)
EXPOSE 8080

# 6. O comando para rodar o app (igual você faria no terminal)
CMD ["mvn", "spring-boot:run"]