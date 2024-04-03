import { useState } from 'react';

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function preloadImage(src: string) {
  return new Promise((resolve, reject) => {
    const img = new (window as any).Image();
    img.onload = () => resolve(img.height);
    img.onerror = reject;
    img.src = src;
  });
}

function App() {
  const [inputValue, setInputValue] = useState('');
  const [imageSrc, setImageSrc] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/shoe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: inputValue }),
      });
      const data = await response.text();

      if (data) {
        preloadImage(data);
        // delay(1000);
      }

      setImageSrc(data);
    } catch (error) {
      console.error('Error posting data:', error);
    }
    setIsLoading(false);
  };

  return (
    <>
      {imageSrc ? (
        <img
          style={{
            width: '512px',
            height: '512px',
            backgroundColor: '#f0f0f0',
          }}
          src={imageSrc}
          alt="Submitted Image"
        />
      ) : (
        <div
          style={{
            width: '512px',
            height: '512px',
            backgroundColor: '#f0f0f0',
          }}></div>
      )}
      <div>
        <textarea
          placeholder="enter shoe description"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          rows={4}
          style={{ resize: 'none', marginBottom: '10px', marginTop: '10px' }}
        />
      </div>
      <div>
        <button onClick={handleSubmit} disabled={isLoading || !inputValue}>
          {isLoading ? 'Loading...' : 'Submit'}
        </button>
      </div>
    </>
  );
}

export default App;
