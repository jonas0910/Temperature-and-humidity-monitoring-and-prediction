// import logo from './logo.svg';
import './App.css';
import Dashboard from './components/dashboard';
import TemperatureHumidityReport from './components/temperature-humidity-report';

function App() {
  return (
    <div className="App">
      {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header> */}
      <Dashboard />
      <TemperatureHumidityReport day="2024-09-16" />
    </div>
  );
}

export default App;
