import Dashboard from './components/dashboard';
import { RealTimeGrafic } from './components/real-time-grafic';
import TemperatureHumidityReport from './components/temperature-humidity-report';
import dayjs from 'dayjs';

function App() {
  return (
    <div className="App">
      <Dashboard />
      <RealTimeGrafic />
      <TemperatureHumidityReport day={dayjs(new Date()).format("YYYY-MM-DD")} />
    </div>
  );
}

export default App;
