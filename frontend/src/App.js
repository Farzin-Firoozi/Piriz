import "./App.css";
import "./index.css";
import Chart from "./components/chart";
import InfoController from "./components/controller";
import ModeSelector from "./components/mode";

function App() {
  return (
    <div className="App">
      <InfoController />
      <Chart />
    </div>
  );
}

export default App;
