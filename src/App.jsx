import { useState } from 'react';
import axios from 'axios';
import { useMutation, useQuery } from '@tanstack/react-query';
import Markdown from 'react-markdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faMicrophone } from '@fortawesome/free-solid-svg-icons';
import './App.css';

// Function to make the API request
const makeAPIRequest = async ({ prompt }) => {
  const modifiedPrompt = `${prompt}. Correct the statement grammatically.`;
  const res = await axios.post("https://correctify-backend.netlify.app/generate", { prompt: modifiedPrompt });
  return res.data;
};

// Function to fetch history
const fetchHistoryData = async () => {
  const res = await axios.get("https://correctify-backend.netlify.app/history");
  return res.data;
};

const App = () => {
  const [prompt, setPrompt] = useState("");
  const [isLightMode, setIsLightMode] = useState(true);

  // Mutation hook for making the API request
  const mutation = useMutation({
    mutationFn: makeAPIRequest,
    onSuccess: () => {
      refetch(); // Refetch history on success
      setPrompt(""); // Clear the prompt input
    },
  });

  // Query hook to fetch history
  const { data: historyData, refetch } = useQuery({
    queryKey: ["history"],
    queryFn: fetchHistoryData,
  });

  // Handler to submit the prompt
  const submitHandler = (e) => {
    e.preventDefault();
    mutation.mutate({ prompt });
  };

  // Handler to toggle dark/light mode
  const modeChange = () => {
    setIsLightMode(prevMode => !prevMode);
  };

  // Microphone functionality
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Sorry, your browser doesn't support speech recognition.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      setPrompt(spokenText);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };

    recognition.start();
  };

  return (
    <div className={`App ${isLightMode ? 'light-mode' : 'dark-mode'}`}>
      <div className='card'>
        <button className='mode-toggle' onClick={modeChange}>
          <FontAwesomeIcon icon={isLightMode ? faMoon : faSun} />
        </button>
        <h1 className='card-title'>CORRECTIFY</h1>
        <p>Enter the sentence to correct it grammatically 😎</p>
        <form className='App-form' onSubmit={submitHandler}>
          <label htmlFor='prompt'>Enter your prompt:</label>
          <input 
            type='text' 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder='Write a content about..'
            className='App-input'
          />
          <button className='App-button' type='submit'>Correct it</button>
        </form>
        <button className='App-button mic-button' onClick={startListening}>
          <FontAwesomeIcon icon={faMicrophone} /> Speak
        </button>
        <section className='App-response'>
          {mutation.isLoading && <p>Generating your content...</p>}
          {mutation.isError && <p>{mutation.error.message}</p>}
          {mutation.isSuccess && (
            <div className='card response-card'>
              {/* Ensure the response is rendered as a string */}
              <Markdown className='markdown-content'>
                {typeof mutation.data === 'string' ? mutation.data : JSON.stringify(mutation.data)}
              </Markdown>
            </div>
          )}
        </section>
        <section className='App-history'>
          <h2>History</h2>
          {historyData?.map((entry, index) => (
            <div key={index} className='response-card'>
              <p><strong>Prompt:</strong> {entry.prompt}</p>
              <Markdown className='markdown-content'>
                {typeof entry.response === 'string' ? entry.response : JSON.stringify(entry.response)}
              </Markdown>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default App;
