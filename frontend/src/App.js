import "./App.css";
import "./index.css";
import InfoController from "./components/controller";
import Logo from "./images/logo.svg";
function App() {
  return (
    <div className="App">
      <div style={{ display: "flex", justifyContent: "center" }}>
        <img
          src={Logo}
          style={{ width: 120, margin: "32px auto" }}
          alt="logo"
        />
      </div>
      <InfoController />
    </div>
  );
}

export default App;
