import { MainMenu } from './arayüz/MainMenu';
import { DesktopUI } from './arayüz/DesktopUI';
import { useGameStore } from './store/gameStore';
import './App.css';

function App() {
  const { name } = useGameStore();

  if (!name) {
    return <MainMenu />;
  }

  return <DesktopUI />;
}

export default App;
