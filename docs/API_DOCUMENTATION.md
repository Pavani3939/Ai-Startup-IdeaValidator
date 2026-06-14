# API Documentation

Base URL: `http://localhost:8080/api`

## Ideas Endpoint

### Analyze Startup Idea
- **URL:** `/ideas/analyze`
- **Method:** `POST`
- **Description:** Submits a startup idea for Gemini AI analysis.
- **Request Body:**
  ```json
  {
    "title": "EcoRide",
    "industry": "Transportation",
    "description": "An electric scooter sharing platform focusing on eco-friendly charging stations."
  }
  ```
- **Response:**
  ```json
  {
    "id": 1,
    "ideaId": 1,
    "summary": "...",
    "advantages": ["..."],
    "disadvantages": ["..."],
    "marketPotential": "...",
    "suggestions": ["..."],
    "successScore": 8
  }
  ```

### Get History
- **URL:** `/ideas/history`
- **Method:** `GET`
- **Query Params:**
  - `page` (default 0)
  - `size` (default 10)
  - `sortBy` (default createdAt)
- **Description:** Retrieves paginated history of analyzed ideas.

## Reports Endpoint

### Get Report Details
- **URL:** `/reports/{id}`
- **Method:** `GET`
- **Description:** Fetches a specific analysis report.

### Download PDF Report
- **URL:** `/reports/{id}/pdf`
- **Method:** `GET`
- **Description:** Returns a generated PDF file for the specific report.
