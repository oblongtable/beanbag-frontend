// src/components/ApiTester.tsx
import { useState, useCallback, ChangeEvent } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { fetchWithAuth } from '../utils/apiClient'; // Adjust path if needed

// --- Interfaces ---
interface ApiAnswer {
  // Assuming backend returns these fields for GET /answers
  ansId?: number; // Optional, might be returned by backend
  quesId?: number; // Optional, might be returned by backend
  text: string; // Or description if backend uses that
  isCorrect: boolean;
  createdAt?: string; // Optional
  updatedAt?: string; // Optional
}

interface ApiQuestion {
  text: string;
  useTimer: boolean;
  timerValue: number;
  answers: ApiAnswer[];
}

interface CreateQuizPayload {
  title: string;
  creatorId: number;
  questions: ApiQuestion[];
}

// Payload for creating a single answer
interface CreateAnswerPayload {
  description: string; // Match Go backend expectation from seed code
  isCorrect: boolean;
}
// --- ---

function ApiTester() {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();

  // --- State for API results and loading/error ---
  const [apiResult, setApiResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- State for GET Quiz ---
  const [getQuizId, setGetQuizId] = useState<string>('1');

  // --- State for CREATE Quiz ---
  const [createQuizTitle, setCreateQuizTitle] = useState<string>('My New Interactive Quiz');
  const [createQuizQuestions, setCreateQuizQuestions] = useState<ApiQuestion[]>([
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

  // --- State for GET Answers ---
  const [getAnswersQuestionId, setGetAnswersQuestionId] = useState<string>('1'); // Default to question ID '1'

  // --- State for CREATE Answer ---
  const [createAnswerQuestionId, setCreateAnswerQuestionId] = useState<string>('1'); // Default to question ID '1'
  const [createAnswerText, setCreateAnswerText] = useState<string>('');
  const [createAnswerIsCorrect, setCreateAnswerIsCorrect] = useState<boolean>(false);


  // --- Handlers for GET Quiz ---
  const handleGetQuiz = useCallback(async () => {
    // ... (keep existing handleGetQuiz code) ...
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
  }, [isAuthenticated, getAccessTokenSilently, getQuizId]);

  // --- Handlers for CREATE Quiz form changes ---
  // ... (keep existing handleTitleChange, handleQuestionChange, handleAnswerChange, etc.) ...
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
        // Ensure the field name matches the interface ('text' vs 'description')
        // If your interface uses 'text', but backend expects 'description', adjust payload creation later
        return { ...q, answers: updatedAnswers };
      })
    );
  };

  const handleAddQuestion = () => {
    setCreateQuizQuestions(prevQuestions => [
      ...prevQuestions,
      { text: '', useTimer: false, timerValue: 0, answers: [{ text: '', isCorrect: false }] },
    ]);
  };

  const handleRemoveQuestion = (qIndex: number) => {
    setCreateQuizQuestions(prevQuestions => prevQuestions.filter((_, index) => index !== qIndex));
  };

  const handleAddAnswer = (qIndex: number) => {
    setCreateQuizQuestions(prevQuestions =>
      prevQuestions.map((q, index) => {
        if (index !== qIndex) return q;
        return { ...q, answers: [...q.answers, { text: '', isCorrect: false }] };
      })
    );
  };

  const handleRemoveAnswer = (qIndex: number, aIndex: number) => {
    setCreateQuizQuestions(prevQuestions =>
      prevQuestions.map((q, index) => {
        if (index !== qIndex || q.answers.length <= 1) return q;
        const updatedAnswers = q.answers.filter((_, ansIndex) => ansIndex !== aIndex);
        return { ...q, answers: updatedAnswers };
      })
    );
  };

  // --- Handler for CREATE Quiz submit ---
  const handleCreateQuiz = useCallback(async () => {
    // ... (keep existing handleCreateQuiz code) ...
    if (!isAuthenticated || !user?.sub) {
      setError("Please log in to create quizzes.");
      return;
    }
    if (!createQuizTitle.trim()) {
        setError("Quiz title cannot be empty.");
        return;
    }
    if (createQuizQuestions.length === 0) {
        setError("Quiz must have at least one question.");
        return;
    }

    setError(null);
    setApiResult(null);
    setIsSubmitting(true);

    const quizPayload: CreateQuizPayload = {
      title: createQuizTitle,
      creatorId: 1, // <<< --- !!! REPLACE WITH ACTUAL LOGIC !!!
      questions: createQuizQuestions.map(q => ({ // Ensure payload matches backend if needed
        ...q,
        // If backend expects 'description' for answers but UI uses 'text'
        // answers: q.answers.map(a => ({ description: a.text, isCorrect: a.isCorrect }))
      })),
    };

    try {
      const response = await fetchWithAuth(getAccessTokenSilently, '/quizzes', {
        method: 'POST',
        body: JSON.stringify(quizPayload),
      });
      if (!response.ok) { /* ... error handling ... */
        let errorDetails = `Status: ${response.status}`;
        try { const errorData = await response.json(); errorDetails += ` - ${JSON.stringify(errorData)}`; }
        catch (jsonError) { const errorText = await response.text(); errorDetails += ` - ${errorText}`; }
        throw new Error(`Failed to create quiz. ${errorDetails}`);
      }
      const createdQuiz = await response.json();
      setApiResult(createdQuiz);
      console.log("Created Quiz:", createdQuiz);
      alert("Quiz created successfully!");
    } catch (err: any) { /* ... error handling ... */
      console.error("Error creating quiz:", err);
      setError(err.message || "An unknown error occurred while creating the quiz.");
      setApiResult(null);
    } finally { setIsSubmitting(false); }
  }, [isAuthenticated, user, getAccessTokenSilently, createQuizTitle, createQuizQuestions]);


  // --- Handler for GET Answers ---
  const handleGetAnswers = useCallback(async () => {
    if (!isAuthenticated) {
      setError("Please log in to fetch answers.");
      return;
    }
    const questionIdNum = parseInt(getAnswersQuestionId, 10);
    if (isNaN(questionIdNum) || questionIdNum <= 0) {
      setError("Please enter a valid positive Question ID.");
      return;
    }

    setError(null);
    setApiResult(null);
    setIsSubmitting(true);

    try {
      // Assuming endpoint is /api/questions/{questionId}/answers
      const response = await fetchWithAuth(getAccessTokenSilently, `/questions/${questionIdNum}/answers`);

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to fetch answers for question ${questionIdNum}. Status: ${response.status}. ${errorData}`);
      }
      const data = await response.json();
      setApiResult(data);
      console.log(`Fetched Answers for Question ${questionIdNum}:`, data);
    } catch (err: any) {
      console.error("Error fetching answers:", err);
      setError(err.message || "An unknown error occurred while fetching answers.");
      setApiResult(null);
    } finally {
      setIsSubmitting(false);
    }
  }, [isAuthenticated, getAccessTokenSilently, getAnswersQuestionId]); // Add dependencies

  // --- Handler for CREATE Answer ---
  const handleCreateAnswer = useCallback(async () => {
    if (!isAuthenticated) {
      setError("Please log in to create an answer.");
      return;
    }
    const questionIdNum = parseInt(createAnswerQuestionId, 10);
    if (isNaN(questionIdNum) || questionIdNum <= 0) {
      setError("Please enter a valid positive Question ID for the answer.");
      return;
    }
    if (!createAnswerText.trim()) {
      setError("Answer text cannot be empty.");
      return;
    }

    setError(null);
    setApiResult(null);
    setIsSubmitting(true);

    // Construct payload - Use 'description' to match Go seed code expectation
    const answerPayload: CreateAnswerPayload = {
      description: createAnswerText,
      isCorrect: createAnswerIsCorrect,
    };

    try {
      // Assuming endpoint is POST /api/questions/{questionId}/answers
      const response = await fetchWithAuth(
        getAccessTokenSilently,
        `/questions/${questionIdNum}/answers`,
        {
          method: 'POST',
          body: JSON.stringify(answerPayload),
        }
      );

      if (!response.ok) {
        let errorDetails = `Status: ${response.status}`;
        try { const errorData = await response.json(); errorDetails += ` - ${JSON.stringify(errorData)}`; }
        catch (jsonError) { const errorText = await response.text(); errorDetails += ` - ${errorText}`; }
        throw new Error(`Failed to create answer for question ${questionIdNum}. ${errorDetails}`);
      }

      const createdAnswer = await response.json();
      setApiResult(createdAnswer);
      console.log("Created Answer:", createdAnswer);
      alert("Answer created successfully!");
      // Optionally clear the input fields
      setCreateAnswerText('');
      setCreateAnswerIsCorrect(false);

    } catch (err: any) {
      console.error("Error creating answer:", err);
      setError(err.message || "An unknown error occurred while creating the answer.");
      setApiResult(null);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isAuthenticated,
    getAccessTokenSilently,
    createAnswerQuestionId,
    createAnswerText,
    createAnswerIsCorrect, // Add dependencies
  ]);


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
              {isSubmitting ? 'Fetching Quiz...' : 'Get Quiz'}
            </button>
          </div>
          <hr style={{ margin: '20px 0' }} />

          {/* --- GET Answers Section --- */}
          <h3>Get Answers by Question ID</h3>
          <div>
            <label htmlFor="getAnswersQuestionIdInput">Question ID: </label>
            <input
              type="number"
              id="getAnswersQuestionIdInput"
              value={getAnswersQuestionId}
              onChange={(e) => setGetAnswersQuestionId(e.target.value)}
              min="1"
              style={{ marginRight: '10px' }}
              disabled={isSubmitting}
            />
            <button onClick={handleGetAnswers} disabled={isSubmitting}>
              {isSubmitting ? 'Fetching Answers...' : 'Get Answers'}
            </button>
          </div>
          <hr style={{ margin: '20px 0' }} />


          {/* --- CREATE Quiz Section --- */}
          <h3>Create New Quiz</h3>
          {/* ... (keep existing Create Quiz form UI) ... */}
          <div>
            <label htmlFor="createQuizTitleInput">Quiz Title: </label>
            <input type="text" id="createQuizTitleInput" value={createQuizTitle} onChange={handleTitleChange} style={{ width: '300px', marginBottom: '15px' }} disabled={isSubmitting} />
          </div>
          <h4>Questions</h4>
          {createQuizQuestions.map((question, qIndex) => (
            <div key={qIndex} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px', position: 'relative' }}>
               <button onClick={() => handleRemoveQuestion(qIndex)} disabled={isSubmitting || createQuizQuestions.length <= 1} style={{ position: 'absolute', top: '5px', right: '5px', background: 'red', color: 'white', border: 'none', cursor: 'pointer' }} title="Remove Question">X</button>
              <div>
                <label htmlFor={`qtext-${qIndex}`}>Question {qIndex + 1}: </label>
                <input type="text" id={`qtext-${qIndex}`} value={question.text} onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)} style={{ width: '80%', marginBottom: '10px' }} disabled={isSubmitting} placeholder="Enter question text"/>
              </div>
              <div>
                <label htmlFor={`qtimer-${qIndex}`}>Use Timer? </label>
                <input type="checkbox" id={`qtimer-${qIndex}`} checked={question.useTimer} onChange={(e) => handleQuestionChange(qIndex, 'useTimer', e.target.checked)} disabled={isSubmitting}/>
                {question.useTimer && (
                  <span style={{ marginLeft: '10px' }}>
                    <label htmlFor={`qtimeval-${qIndex}`}>Timer (sec): </label>
                    <input type="number" id={`qtimeval-${qIndex}`} value={question.timerValue} onChange={(e) => handleQuestionChange(qIndex, 'timerValue', parseInt(e.target.value, 10) || 0)} min="0" style={{ width: '60px' }} disabled={isSubmitting}/>
                  </span>
                )}
              </div>
              <h5>Answers</h5>
              {question.answers.map((answer, aIndex) => (
                <div key={aIndex} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px', marginLeft: '20px' }}>
                  <input type="text" value={answer.text} onChange={(e) => handleAnswerChange(qIndex, aIndex, 'text', e.target.value)} style={{ flexGrow: 1, marginRight: '10px' }} disabled={isSubmitting} placeholder={`Answer ${aIndex + 1}`}/>
                  <label htmlFor={`correct-${qIndex}-${aIndex}`} style={{ marginRight: '5px' }}>Correct?</label>
                  <input type="checkbox" id={`correct-${qIndex}-${aIndex}`} checked={answer.isCorrect} onChange={(e) => handleAnswerChange(qIndex, aIndex, 'isCorrect', e.target.checked)} disabled={isSubmitting} style={{ marginRight: '10px' }}/>
                  <button onClick={() => handleRemoveAnswer(qIndex, aIndex)} disabled={isSubmitting || question.answers.length <= 1} style={{ background: 'orange', color: 'white', border: 'none', cursor: 'pointer', padding: '2px 5px' }} title="Remove Answer">X</button>
                </div>
              ))}
              <button onClick={() => handleAddAnswer(qIndex)} disabled={isSubmitting} style={{ marginTop: '10px', marginLeft: '20px' }}>Add Answer</button>
            </div>
          ))}
          <button onClick={handleAddQuestion} disabled={isSubmitting} style={{ marginTop: '10px', marginBottom: '20px' }}>Add Question</button>
          <br />
          <button onClick={handleCreateQuiz} disabled={isSubmitting}>
            {isSubmitting ? 'Creating Quiz...' : 'Create Quiz Now'}
          </button>
          <hr style={{ margin: '20px 0' }} />

          {/* --- CREATE Answer Section --- */}
          <h3>Create New Answer</h3>
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="createAnswerQuestionIdInput">For Question ID: </label>
            <input
              type="number"
              id="createAnswerQuestionIdInput"
              value={createAnswerQuestionId}
              onChange={(e) => setCreateAnswerQuestionId(e.target.value)}
              min="1"
              style={{ marginRight: '10px', width: '80px' }}
              disabled={isSubmitting}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="createAnswerTextInput">Answer Text: </label>
            <input
              type="text"
              id="createAnswerTextInput"
              value={createAnswerText}
              onChange={(e) => setCreateAnswerText(e.target.value)}
              style={{ width: '300px', marginRight: '10px' }}
              disabled={isSubmitting}
              placeholder="Enter answer text"
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="createAnswerIsCorrectInput">Is Correct? </label>
            <input
              type="checkbox"
              id="createAnswerIsCorrectInput"
              checked={createAnswerIsCorrect}
              onChange={(e) => setCreateAnswerIsCorrect(e.target.checked)}
              disabled={isSubmitting}
            />
          </div>
          <button onClick={handleCreateAnswer} disabled={isSubmitting}>
            {isSubmitting ? 'Creating Answer...' : 'Create Answer Now'}
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

export default ApiTester;
