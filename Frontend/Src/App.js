import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState('');
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await fetch('http://localhost:5000/history');
            const data = await res.json();
            setHistory(data.history);
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            });
            const data = await res.json();
            setResponse(data.story);
            fetchHistory(); // Refresh history
        } catch (error) {
            console.error('Error generating story:', error);
        }
        setLoading(false);
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) {
            alert('Please select an image.');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch('http://localhost:5000/upload-image', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (data.error) {
                alert(`Error: ${data.error}`);
            } else {
                alert(`Image uploaded successfully! File path: ${data.file_path}`);
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error uploading image. Please try again.');
        }
    };

    return (
        <div className="app-container">
            {/* Sidebar for History */}
            <aside className="history-sidebar">
                <h2>History</h2>
                <ul>
                    {history.map((item, index) => (
                        <li key={index}>
                            <strong>Prompt:</strong> {item.prompt} <br />
                            <strong>Story:</strong> {item.story}
                        </li>
                    ))}
                </ul>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header>
                    <h1>AI Story Generator</h1>
                    <p>Let AI craft amazing stories or poems based on your ideas!</p>
                </header>

                {/* Prompt Input */}
                <textarea
                    className="prompt-box"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter your story prompt here..."
                ></textarea>
                <button className="generate-button" onClick={handleGenerate} disabled={loading}>
                    {loading ? 'Generating...' : 'Generate Story'}
                </button>

                {/* Image Upload */}
                <div className="upload-section">
                    <label htmlFor="image-upload" className="upload-label">
                        Upload an Image (optional):
                    </label>
                    <input
                        type="file"
                        id="image-upload"
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
                </div>

                {/* Generated Response */}
                {response && (
                    <div className="response-box">
                        <h2>Your Generated Story</h2>
                        <p>{response}</p>
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;
