# OptiFit

OptiFit is a web application designed to provide personalized diet and training programs generated by artificial intelligence. Users can register and input their data (height, weight, age, etc.), receive AI-generated diet and training programs, modify these programs, and track their progress over time.

## Features

- **Personalized Diet Plan:** Receive and customize diet plans created by AI, considering user data and allergies.
- **Training Program:** Get AI-generated training routines tailored to the user's fitness level and goals.
- **Training Notebook:** Record repetitions, weights lifted, and view training history.

## Technologies Used

- **Frontend,Backend:** React, Next.js
- **Database:** MongoDB
- **Authentication:** NextAuth.js
- **AI Integration:** Gemini AI

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/AlexDvalishvili1/OptiFit.git
    ```

2. Install the dependencies:
    ```sh
    npm i --force
    ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following environment variables (replace the placeholder values with your actual credentials):

    ```sh
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET=your-nextauth-secret
    MONGODB_URI=your-mongodb-uri
    GOOGLE_CLIENT_ID=your-google-client-id
    GOOGLE_CLIENT_SECRET=your-google-client-secret
    FACEBOOK_CLIENT_ID=your-facebook-client-id
    FACEBOOK_CLIENT_SECRET=your-facebook-client-secret
    GITHUB_ID=your-github-id
    GITHUB_SECRET=your-github-secret
    API_KEY=your-gemini-ai-api-key
    ```

### Running the Project

1. Build the project:
    ```sh
    npm run build
    ```

2. Start the project:
    ```sh
    npm run start
    ```

3. Open your browser and navigate to `http://localhost:3000` to view the application.

## Usage

1. **Register:** Create an account by providing the necessary information.
2. **Input Data:** Enter your height, weight, age, any allergies an others.
3. **Diet Plan:** Receive a personalized diet plan generated by AI and customize it as needed.
4. **Training Program:** Get a training program tailored to your needs.
5. **Notebook:** Record your workouts and track your progress over time.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any bugs or feature requests.

## Contact

For any inquiries or support, please contact:

- Name: Alex
- Email: alex-dvalishvili@mail.ru