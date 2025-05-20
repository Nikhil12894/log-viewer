


import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Landing from './Home/Landing';
import MainApp from './MainApp/MainApp';

function App() {

  return (
    <BrowserRouter basename="/cem/bff/log-viewer/quinoa">
      <Routes>
        <Route path="/" element={<Landing/>} />
        <Route path="/explorer" element={<MainApp  />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;