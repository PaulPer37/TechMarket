# TechMarket - Marketplace C2C

Plataforma web para la compra y venta de productos tecnológicos y contratación de servicios técnicos. Proyecto final de Lenguajes de Programación.

## 👥 Integrantes del Grupo
* **Paul Perdomo Ordoñez**
* **Danilo Drouet Rodriguez**
* **Anthony Herrera León**

## 🛠️ Tecnologías y Versiones Utilizadas
Este proyecto ha sido desarrollado y probado con las siguientes herramientas y versiones específicas:

### Backend
* **Lenguaje:** PHP **8.1.2** (Compatible con v7.4+).
* **Base de Datos:** MySQL **8.0** / MariaDB **10.4+**.
* **Extensiones PHP:** `pdo_mysql` (Habilitada por defecto en XAMPP/Laragon).

### Frontend
* **Framework CSS:** Bootstrap **5.3.0** (Vía CDN).
* **JavaScript:** Vanilla JS (ECMAScript 6+).
* **Iconos:** Bootstrap Icons (Vía CDN).

### Entorno de Desarrollo
* **Servidor Web:** Apache 2.4 (Incluido en XAMPP/LAMPP).
* **Sistema Operativo:** Probado en Ubuntu 22.04 LTS y Windows 10/11.
* **Navegadores:** Google Chrome (v120+), Firefox, Edge.

---

## 📋 Requisitos Previos
* **Sistema Operativo:** Ubuntu / Linux (o Windows con XAMPP).
* **PHP:** Instalado en la terminal (`php -v`).
* **MySQL Server:** Instalado y corriendo (`sudo systemctl start mysql`).

## 🚀 Guía de Instalación Rápida

Sigue estos 3 pasos para poner el proyecto a funcionar:

### Paso 1: Configurar la Base de Datos
El proyecto está configurado para usar un usuario específico. Abre tu terminal y ejecuta estos comandos para crear la base de datos y el usuario:

1.  Entra a la consola de MySQL:
    ```bash
    sudo mysql
    ```

2.  Copia y pega este bloque completo dentro de MySQL para configurar todo:
    ```sql
    CREATE DATABASE IF NOT EXISTS techmarket_db;
    CREATE USER IF NOT EXISTS 'admin'@'localhost' IDENTIFIED WITH mysql_native_password BY 'admin';
    GRANT ALL PRIVILEGES ON techmarket_db.* TO 'admin'@'localhost';
    FLUSH PRIVILEGES;
    EXIT;
    ```

3.  Importa las tablas y datos iniciales (ejecuta esto en la terminal, dentro de la carpeta del proyecto):
    ```bash
    mysql -u admin -p techmarket_db < database/database.sql
    ```
    *(Cuando te pida contraseña, escribe: `admin`)*


### Paso 2: Ejecutar el Proyecto
La forma más sencilla de probarlo es usando el servidor interno de PHP.

1.  Abre la terminal dentro de la carpeta `TechMarket`.
2.  Ejecuta el siguiente comando:
    ```bash
    php -S localhost:8000
    ```
3.  Abre tu navegador y entra a:
    👉 **http://localhost:8000/frontend/pages/index.html**

---
