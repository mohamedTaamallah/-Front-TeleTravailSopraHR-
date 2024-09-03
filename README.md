**Developed by:** Taamallah Mohamed | khazri Omar 
**Email:** mohamedtaamallah2020@gmail.com  
**GitHub:** [mohamedTaamallah](https://github.com/mohamedTaamallah/)

# Fuse - Admin template and Starter project for Angular

This project was generated with [Angular CLI](https://github.com/angular/angular-cli)

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice.  To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## Remote Work Platefom Intro
This project is a remote work platform, that will help the user which are divided into 3 actors

In this project we used the fuse angular template which you can find the full documentation through this link (https://angular-material.fusetheme.com/dashboards/project)

We used as libraries Syncfusion (https://support.syncfusion.com) and angular materials 
(https://material.angular.io/)

### Key Features

- **User Management:** Create, update, and manage user profiles.
- **Remote Work Requests:** Submit, approve, or reject remote work requests with specific rules based on user roles.
- **Scheduler:** Visual calendar to manage and track remote work days.
- **Role-Based Access Control:** Different levels of access and functionalities for various user roles.
- **Notifications:** Instant notifications for remote work requests and approvals.


## Setup and Installation

### Prerequisites

- **Node.js** (version 14.x or later)
- **Angular CLI** (version 15.x or later)
- **Java** (version 11 or later)
- **Maven** for building the Spring Boot backend
- **PostgreSQL** for database

## Running the Project

### Backend

1. Navigate to the backend directory:
    ```bash
    cd backend
    ```
2. Build the project using Maven:
    ```bash
    mvn clean install
    ```
3. Run the Spring Boot application:
    ```bash
    mvn spring-boot:run
    ```

### Frontend

1. Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Serve the Angular application:
    ```bash
    ng serve
    ```
4. Open your browser and navigate to `http://localhost:4200/`.

## Remote Work Platefom architecture 
The platforme was developped in Angular / spring boot, each collaborator has its own fil where all the component related to each one , also each one has its own service where all the connection are being made with the backend 

## Remote Work Platefom layout 
So Fuse offers multiple layout selection where you can define it in the file down below 
'src\app\core\config\app.config.ts'

The navigation elements are set in the file below 
'src\app\mock-api\common\navigation\data.ts'

All the services are present in this folder 
'src\app\core\auth'

All the components are present in this folder 
'src\app\modules'

All the confirmation layout related are in this folder 
'src\@fuse\services\confirmation'