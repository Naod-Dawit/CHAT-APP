import { Routes, Route } from "react-router-dom";

import Chat from "./component/Chatpage";
import AuthPage from "./component/Authpage";

function App() {
  return (
    <>
      <Routes>
        <Route path="/userpage" element={<Chat />} />
        <Route path="/" element={<AuthPage />} />
      </Routes>
    </>
  );
}

export default App;
