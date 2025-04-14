import { useState, useCallback, ChangeEvent } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { fetchWithAuth } from '../utils/apiClient';
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";

// Default example payload for the textarea
const defaultCreatePayload = `{
  "title": "My Full Science Quiz",
  "creator_id": 1,
  "questions": [
    {
      "text": "What is H2O?",
      "useTimer": false,
      "timerValue": 0,
      "answers": [
        {
          "text": "Oxygen",
          "isCorrect": false
        },
        {
          "text": "Water",
          "isCorrect": true
        },
        {
          "text": "Hydrogen Peroxide",
          "isCorrect": false
        }
      ]
    },
    {
      "text": "What is the closest star?",
      "useTimer": true,
      "timerValue": 20,
      "answers": [
        {
          "text": "The Sun",
          "isCorrect": true
        },
        {
          "text": "Proxima Centauri",
          "isCorrect": false
        },
        {
          "text": "Alpha Centauri A",
          "isCorrect": false
        }
      ]
    }
  ]
}`;

function ApiTester() {
  const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();

  // --- State for API results and loading/error ---
  const [apiResult, setApiResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- State for GET request input ---
  const [getQuizId, setGetQuizId] = useState<string>('1'); // Default to '1', input is string

  // --- State for POST request JSON payload ---
  const [createQuizJsonPayload, setCreateQuizJsonPayload] = useState<string>(defaultCreatePayload);

  // --- Handler for GET FULL Quiz ---
  const handleGetFullQuiz = useCallback(async () => {
    if (!isAuthenticated) {
      setError("Please log in to fetch quizzes.");
      return;
    }
    const quizIdNum = parseInt(getQuizId, 10);
    if (isNaN(quizIdNum) || quizIdNum <= 0) {
      setError("Please enter a valid positive Quiz ID.");
      return;
    }

    setError(null);
    setApiResult(null);
    setIsSubmitting(true);

    try {
      // Use the /full endpoint
      const response = await fetchWithAuth(getAccessTokenSilently, `/quizzes/${quizIdNum}/full`);
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to fetch full quiz ${quizIdNum}. Status: ${response.status}. ${errorData}`);
      }
      const data = await response.json();
      setApiResult(data);
      console.log("Fetched Full Quiz:", data);
    } catch (err: any) {
      console.error("Error fetching full quiz:", err);
      setError(err.message || "An unknown error occurred while fetching the full quiz.");
      setApiResult(null);
    } finally {
      setIsSubmitting(false);
    }
  }, [isAuthenticated, getAccessTokenSilently, getQuizId]); // Include getQuizId

  // --- Handler for POST submit ---
  const handleCreateQuizFromJson = useCallback(async () => {
    if (!isAuthenticated) {
      setError("Please log in to create quizzes.");
      return;
    }

    setError(null);
    setApiResult(null);
    setIsSubmitting(true);

    let parsedPayload;
    try {
      parsedPayload = JSON.parse(createQuizJsonPayload);
      // Basic validation on parsed payload (optional but good practice)
      if (!parsedPayload.title || !parsedPayload.creator_id || !Array.isArray(parsedPayload.questions)) {
          throw new Error("Invalid JSON structure: Missing title, creator_id, or questions array.");
      }
      // Add more specific validation if needed (e.g., question/answer content)
    } catch (parseError: any) {
      setError(`Invalid JSON payload: ${parseError.message}`);
      setIsSubmitting(false);
      return;
    }

    // TODO: The backend handler should ideally verify this against the JWT user.
    console.log("Sending creator_id:", parsedPayload.creator_id); // Log the ID being sent

    try {
      // Use the correct route from main.go for minimal/full creation
      const response = await fetchWithAuth(
        getAccessTokenSilently,
        '/quizzes/minimal', // Ensure this matches your backend route in main.go
        {
          method: 'POST',
          // Send the original JSON string directly after validation
          body: JSON.stringify(parsedPayload),
        }
      );

      if (!response.ok) {
        let errorDetails = `Status: ${response.status}`;
        try {
            const errorData = await response.json();
            errorDetails += ` - ${JSON.stringify(errorData)}`;
        } catch (jsonError) {
            // Fallback if error response is not JSON
            const errorText = await response.text();
            errorDetails += ` - ${errorText}`;
        }
        throw new Error(`Failed to create quiz. ${errorDetails}`);
      }

      const createdQuiz = await response.json();
      setApiResult(createdQuiz);
      console.log("Created Quiz:", createdQuiz);
      alert("Quiz created successfully!");

    } catch (err: any) {
      console.error("Error creating quiz:", err);
      setError(err.message || "An unknown error occurred while creating the quiz.");
      setApiResult(null);
    } finally {
      setIsSubmitting(false);
    }
  }, [isAuthenticated, getAccessTokenSilently, createQuizJsonPayload]); // Dependency is the JSON string

  // --- Render logic ---
  if (isLoading) return <div>Loading authentication...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Quiz API Tester</h2>
      {!isAuthenticated ? (
        <p>Please log in to test the Quiz API.</p>
      ) : (
        <div>
          <hr style={{ margin: '20px 0' }} />

          {/* --- GET Full Quiz Section --- */}
          <h3>Get Full Quiz by ID</h3>
          <div>
            <label htmlFor="getQuizIdInput">Quiz ID: </label>
            <Input // Use your Input component
              type="number"
              id="getQuizIdInput"
              value={getQuizId}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setGetQuizId(e.target.value)}
              min="1"
              style={{ marginRight: '10px', width: '80px' }}
              disabled={isSubmitting}
            />
            <Button onClick={handleGetFullQuiz} disabled={isSubmitting}>
              {isSubmitting ? 'Fetching...' : 'Get Full Quiz'}
            </Button>
          </div>
          <hr style={{ margin: '20px 0' }} />

          {/* --- Side-by-Side Container for Create and Result --- */}
          <div style={{ display: 'flex', gap: '20px' }}>

            {/* --- CREATE Quiz Section (Left Side) --- */}
            <div style={{ flex: 1 }}> {/* Takes up half the space */}
              <h3>Create New Quiz (from JSON)</h3>
              <div>
                <label htmlFor="createQuizJsonInput">Quiz JSON Payload:</label>
                <p style={{fontSize: '0.8em', color: '#555'}}>
                    Paste/Edit the full JSON structure here. **Ensure `creator_id` is a valid user ID from your database.**
                </p>
                <Textarea // Use your Textarea component
                  id="createQuizJsonInput"
                  value={createQuizJsonPayload}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setCreateQuizJsonPayload(e.target.value)}
                  rows={25} // Adjust height as needed
                  style={{ width: '100%', marginBottom: '10px', fontFamily: 'monospace', boxSizing: 'border-box' }} // Use 100% width and box-sizing
                  disabled={isSubmitting}
                  placeholder="Enter JSON payload for creating a quiz..."
                />
              </div>
              <Button onClick={handleCreateQuizFromJson} disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Quiz from JSON'}
              </Button>
            </div>

            {/* --- Result/Error Display (Right Side) --- */}
            <div style={{ flex: 1 }}> {/* Takes up the other half */}
              <h3>Last API Result:</h3>
              {error && <p style={{ color: 'red', fontWeight: 'bold' }}>Error: {error}</p>}

              {apiResult ? (
                <pre style={{
                  background: '#f0f0f0',
                  padding: '10px',
                  border: '1px solid #ccc',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  height: 'calc(1.2em * 25 + 22px + 1.6em + 10px)', // Try to match textarea height roughly
                  overflowY: 'auto', // Add scroll if content exceeds height
                  boxSizing: 'border-box'
                }}>
                  {JSON.stringify(apiResult, null, 2)}
                </pre>
              ) : (
                 <div style={{
                    background: '#f0f0f0',
                    padding: '10px',
                    border: '1px solid #ccc',
                    height: 'calc(1.2em * 25 + 22px + 1.6em + 10px)', // Match height even when empty
                    boxSizing: 'border-box',
                    color: '#888'
                 }}>
                    (No result yet)
                 </div>
              )}
            </div>

          </div> {/* End Side-by-Side Container */}

        </div>
      )}
    </div>
  );
}

export default ApiTester;
