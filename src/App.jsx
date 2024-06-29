import { useState } from 'react';
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import Markdown from 'react-markdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import './App.css';

const makeAPIRequest = async(prompt) => {
  const res = await axios.post("https://geminiaiserver.onrender.com/generate", { prompt });
  return res.data;
}

const App = () => {
  const [prompt, setPrompt] = useState("");
  const [isLightMode, setIsLightMode] = useState(true);
  const mutation = useMutation({
    mutationFn: makeAPIRequest,
    mutationKey: ["gemini-api-request"],
  });

  const submitHandler = (e) => {
    e.preventDefault();
    mutation.mutate(prompt);
  };

  const modeChange = () => {
    setIsLightMode(prevMode => !prevMode);
  }

  return (
    <div className={`App ${isLightMode ? 'light-mode' : 'dark-mode'}`}>
      <div className='card'>
        <button className='mode-toggle' onClick={modeChange}>
          <FontAwesomeIcon icon={isLightMode ? faMoon : faSun} />
        </button>
        <h1 className='card-title'>GEMINI AI PROJECT</h1>
        <p>Enter a prompt and let AI craft a unique content for you.</p>
        <form className='App-form' onSubmit={submitHandler}>
          <label htmlFor='prompt'>Enter your prompt:</label>
          <input 
            type='text' 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder='Write a content about..'
            className='App-input'
          />
          <button className='App-button' type='submit'>Generate Content</button>
        </form>
        <section className='App-response'>
          {mutation.isPending && <p>Generating your content...</p>}
          {mutation.isError && <p>{mutation.error.message}</p>}
          {mutation.isSuccess && (
            <div className='card response-card'>
              <Markdown className='markdown-content'>{mutation.data}</Markdown>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default App