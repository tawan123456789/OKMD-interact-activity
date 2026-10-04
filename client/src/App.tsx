import { Routes, Route } from "react-router-dom";
import { AdminConsole } from "./pages/AdminConsole";
import { RandomNumberGame } from "./games/random-number/RandomNumberGame";
import { RandomNumberEdit } from "./games/random-number/RandomNumberEdit";
import { GuessWordGame } from "./games/guess-word/GuessWordGame";
import { GuessWordEdit } from "./games/guess-word/GuessWordEdit";
import { GuessPictureGame } from "./games/guess-picture/GuessPictureGame";
import { GuessPictureEdit } from "./games/guess-picture/GuessPictureEdit";
import { NumberCutGame } from "./games/number-cut/NumberCutGame";
import { NumberCutEdit } from "./games/number-cut/NumberCutEdit";
import { NotFound } from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AdminConsole />} />

      <Route path="/random-number" element={<RandomNumberGame />} />
      <Route path="/random-number/edit" element={<RandomNumberEdit />} />

      <Route path="/guess-word" element={<GuessWordGame />} />
      <Route path="/guess-word/edit" element={<GuessWordEdit />} />

      <Route path="/guess-picture" element={<GuessPictureGame />} />
      <Route path="/guess-picture/edit" element={<GuessPictureEdit />} />

      <Route path="/number-cut" element={<NumberCutGame />} />
      <Route path="/number-cut/edit" element={<NumberCutEdit />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
