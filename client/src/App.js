import './App.css';
import ColorPicker from './components/ColorPicker';
import Mode from './components/Mode';
import Switcher from './components/Switcher';
import Titulo from './components/Titulo';


function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Titulo />
        <Switcher />
        <Mode />
        <ColorPicker />
      </header>
    </div>
  );
}

export default App;
