// src/components/QuizApiTester.tsx (or QuizManager.tsx)
import { useState, useCallback, ChangeEvent } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { fetchWithAuth } from '../utils/apiClient'; // Adjust path if needed

// --- Interfaces (keep these as they match Go models) ---
interface ApiAnswer {
  text: string;
  isCorrect: boolean;
}

interface ApiQuestion {
  text: string;
  useTimer: boolean;
  timerValue: number;
  answers: ApiAnswer[];
}

interface CreateQuizPayload {
  title: string;
  creatorId: number; // Still needs proper handling
  questions: ApiQuestion[];
}
// --- ---

function QuizManager() {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();

  // --- State for API results and loading/error ---
  const [apiResult, setApiResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- State for GET request input ---
  const [getQuizId, setGetQuizId] = useState<string>('1'); // Default to '1', input is string

  // --- State for POST request inputs ---
  const [createQuizTitle, setCreateQuizTitle] = useState<string>('My New Interactive Quiz');
  const [createQuizQuestions, setCreateQuizQuestions] = useState<ApiQuestion[]>([
    // Start with one example question
    {
      text: 'What is the default first question?',
      useTimer: false,
      timerValue: 0,
      answers: [
        { text: 'Answer A', isCorrect: true },
        { text: 'Answer B', isCorrect: false },
      ],
    },
  ]);

  // --- Handlers for GET ---
  const handleGetQuiz = useCallback(async () => {
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
      const response = await fetchWithAuth(getAccessTokenSilently, `/quizzes/${quizIdNum}`);
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to fetch quiz ${quizIdNum}. Status: ${response.status}. ${errorData}`);
      }
      const data = await response.json();
      setApiResult(data);
      console.log("Fetched Quiz:", data);
    } catch (err: any) {
      console.error("Error fetching quiz:", err);
      setError(err.message || "An unknown error occurred while fetching the quiz.");
      setApiResult(null);
    } finally {
      setIsSubmitting(false);
    }
  }, [isAuthenticated, getAccessTokenSilently, getQuizId]); // Include getQuizId

  // --- Handlers for POST form changes ---

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCreateQuizTitle(e.target.value);
  };

  const handleQuestionChange = (qIndex: number, field: keyof ApiQuestion, value: any) => {
    setCreateQuizQuestions(prevQuestions =>
      prevQuestions.map((q, index) =>
        index === qIndex ? { ...q, [field]: value } : q
      )
    );
  };

  const handleAnswerChange = (qIndex: number, aIndex: number, field: keyof ApiAnswer, value: any) => {
    setCreateQuizQuestions(prevQuestions =>
      prevQuestions.map((q, index) => {
        if (index !== qIndex) return q;
        const updatedAnswers = q.answers.map((a, ansIndex) =>
          ansIndex === aIndex ? { ...a, [field]: value } : a
        );
        return { ...q, answers: updatedAnswers };
      })
    );
  };

  const handleAddQuestion = () => {
    setCreateQuizQuestions(prevQuestions => [
      ...prevQuestions,
      { // Add a new blank question structure
        text: '',
        useTimer: false,
        timerValue: 0,
        answers: [{ text: '', isCorrect: false }], // Start with one blank answer
      },
    ]);
  };

  const handleRemoveQuestion = (qIndex: number) => {
    setCreateQuizQuestions(prevQuestions => prevQuestions.filter((_, index) => index !== qIndex));
  };

  const handleAddAnswer = (qIndex: number) => {
    setCreateQuizQuestions(prevQuestions =>
      prevQuestions.map((q, index) => {
        if (index !== qIndex) return q;
        return {
          ...q,
          answers: [...q.answers, { text: '', isCorrect: false }], // Add new blank answer
        };
      })
    );
  };

  const handleRemoveAnswer = (qIndex: number, aIndex: number) => {
    setCreateQuizQuestions(prevQuestions =>
      prevQuestions.map((q, index) => {
        if (index !== qIndex) return q;
        // Prevent removing the last answer
        if (q.answers.length <= 1) return q;
        const updatedAnswers = q.answers.filter((_, ansIndex) => ansIndex !== aIndex);
        return { ...q, answers: updatedAnswers };
      })
    );
  };


  // --- Handler for POST submit ---
  const handleCreateQuiz = useCallback(async () => {
    if (!isAuthenticated || !user?.sub) {
      setError("Please log in to create quizzes.");
      return;
    }
     // Basic validation
    if (!createQuizTitle.trim()) {
        setError("Quiz title cannot be empty.");
        return;
    }
    if (createQuizQuestions.length === 0) {
        setError("Quiz must have at least one question.");
        return;
    }
    // Add more validation as needed (e.g., check for empty questions/answers, at least one correct answer per question)


    setError(null);
    setApiResult(null);
    setIsSubmitting(true);

    // Construct payload from state
    const quizPayload: CreateQuizPayload = {
      title: createQuizTitle,
      // !!! IMPORTANT: Still using placeholder creatorId !!!
      // You MUST implement logic to get the correct int32 user ID.
      // Example: Fetch from your backend: GET /api/users/me -> returns { internalId: 123 }
      creatorId: 1, // <<< --- !!! REPLACE WITH ACTUAL LOGIC !!!
      questions: createQuizQuestions, // Use the state directly
    };

    try {
      const response = await fetchWithAuth(
        getAccessTokenSilently,
        '/quizzes',
        {
          method: 'POST',
          body: JSON.stringify(quizPayload),
        }
      );

      if (!response.ok) {
        let errorDetails = `Status: ${response.status}`;
        try {
            const errorData = await response.json();
            errorDetails += ` - ${JSON.stringify(errorData)}`;
        } catch (jsonError) {
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
    // Keep state dependencies: title, questions, user, isAuthenticated, getAccessTokenSilently
  }, [isAuthenticated, user, getAccessTokenSilently, createQuizTitle, createQuizQuestions]);

  // --- Render logic ---
  if (isLoading) return <div>Loading authentication...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Quiz API Tester</h2>
      {!isAuthenticated ? (
        <p>Please log in to test the Quiz API.</p>
      ) : (
        <div>
          <p>Welcome, {user?.name}!</p>
          <hr style={{ margin: '20px 0' }} />

          {/* --- GET Quiz Section --- */}
          <h3>Get Quiz by ID</h3>
          <div>
            <label htmlFor="getQuizIdInput">Quiz ID: </label>
            <input
              type="number"
              id="getQuizIdInput"
              value={getQuizId}
              onChange={(e) => setGetQuizId(e.target.value)}
              min="1"
              style={{ marginRight: '10px' }}
              disabled={isSubmitting}
            />
            <button onClick={handleGetQuiz} disabled={isSubmitting}>
              {isSubmitting ? 'Fetching...' : 'Get Quiz'}
            </button>
          </div>
          <hr style={{ margin: '20px 0' }} />

          {/* --- CREATE Quiz Section --- */}
          <h3>Create New Quiz</h3>
          <div>
            <label htmlFor="createQuizTitleInput">Quiz Title: </label>
            <input
              type="text"
              id="createQuizTitleInput"
              value={createQuizTitle}
              onChange={handleTitleChange}
              style={{ width: '300px', marginBottom: '15px' }}
              disabled={isSubmitting}
            />
          </div>

          <h4>Questions</h4>
          {createQuizQuestions.map((question, qIndex) => (
            <div key={qIndex} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px', position: 'relative' }}>
               <button
                 onClick={() => handleRemoveQuestion(qIndex)}
                 disabled={isSubmitting || createQuizQuestions.length <= 1} // Prevent removing the last question easily
                 style={{ position: 'absolute', top: '5px', right: '5px', background: 'red', color: 'white', border: 'none', cursor: 'pointer' }}
                 title="Remove Question"
               >
                 X
               </button>
              <div>
                <label htmlFor={`qtext-${qIndex}`}>Question {qIndex + 1}: </label>
                <input
                  type="text"
                  id={`qtext-${qIndex}`}
                  value={question.text}
                  onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                  style={{ width: '80%', marginBottom: '10px' }}
                  disabled={isSubmitting}
                  placeholder="Enter question text"
                />
              </div>
              <div>
                <label htmlFor={`qtimer-${qIndex}`}>Use Timer? </label>
                <input
                  type="checkbox"
                  id={`qtimer-${qIndex}`}
                  checked={question.useTimer}
                  onChange={(e) => handleQuestionChange(qIndex, 'useTimer', e.target.checked)}
                  disabled={isSubmitting}
                />
                {question.useTimer && (
                  <span style={{ marginLeft: '10px' }}>
                    <label htmlFor={`qtimeval-${qIndex}`}>Timer (sec): </label>
                    <input
                      type="number"
                      id={`qtimeval-${qIndex}`}
                      value={question.timerValue}
                      onChange={(e) => handleQuestionChange(qIndex, 'timerValue', parseInt(e.target.value, 10) || 0)}
                      min="0"
                      style={{ width: '60px' }}
                      disabled={isSubmitting}
                    />
                  </span>
                )}
              </div>

              <h5>Answers</h5>
              {question.answers.map((answer, aIndex) => (
                <div key={aIndex} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px', marginLeft: '20px' }}>
                  <input
                    type="text"
                    value={answer.text}
                    onChange={(e) => handleAnswerChange(qIndex, aIndex, 'text', e.target.value)}
                    style={{ flexGrow: 1, marginRight: '10px' }}
                    disabled={isSubmitting}
                    placeholder={`Answer ${aIndex + 1}`}
                  />
                  <label htmlFor={`correct-${qIndex}-${aIndex}`} style={{ marginRight: '5px' }}>Correct?</label>
                  <input
                    type="checkbox"
                    id={`correct-${qIndex}-${aIndex}`}
                    checked={answer.isCorrect}
                    onChange={(e) => handleAnswerChange(qIndex, aIndex, 'isCorrect', e.target.checked)}
                    disabled={isSubmitting}
                    style={{ marginRight: '10px' }}
                  />
                  <button
                    onClick={() => handleRemoveAnswer(qIndex, aIndex)}
                    disabled={isSubmitting || question.answers.length <= 1} // Prevent removing last answer
                    style={{ background: 'orange', color: 'white', border: 'none', cursor: 'pointer', padding: '2px 5px' }}
                    title="Remove Answer"
                  >
                    X
                  </button>
                </div>
              ))}
              <button onClick={() => handleAddAnswer(qIndex)} disabled={isSubmitting} style={{ marginTop: '10px', marginLeft: '20px' }}>
                Add Answer
              </button>
            </div>
          ))}
          <button onClick={handleAddQuestion} disabled={isSubmitting} style={{ marginTop: '10px', marginBottom: '20px' }}>
            Add Question
          </button>
          <br />
          <button onClick={handleCreateQuiz} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Quiz Now'}
          </button>

          <hr style={{ margin: '20px 0' }} />

          {/* --- Result/Error Display --- */}
          {error && <p style={{ color: 'red', fontWeight: 'bold' }}>Error: {error}</p>}

          {apiResult && (
            <div>
              <h3>Last API Result:</h3>
              <pre style={{ background: '#f0f0f0', padding: '10px', border: '1px solid #ccc', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {JSON.stringify(apiResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default QuizManager;
