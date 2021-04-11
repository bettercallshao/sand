import "./App.css";
import { useState, useEffect } from "react";
import { Chart } from "react-google-charts";
import sandio from "sandio";

function App() {
  // keep raw data as list of dict
  const [raw, setRaw] = useState([]);
  useEffect(() => {
    sandio.run(
      {
        Version: "v1",
        Config: {
          StepCount: 2000,
          StepSize: 0.01,
          Separator: ":",
        },
        Box: [
          {
            Id: "cons0",
            Type: "sin",
            Input: [
              {
                Id: "period",
                Source: "param0",
              },
              {
                Id: "shift",
                Source: "param1",
              },
            ],
          },
          {
            Id: "pers0",
            Type: "integrate",
            Input: [{ Id: "x", Source: "cons0:x" }],
          },
        ],
        Variable: [
          {
            Id: "param0",
            Type: "float",
            Value: 10,
          },
          {
            Id: "param1",
            Type: "float",
            Value: 2,
          },
          {
            Id: "cons0:x",
            Type: "float",
            Value: 0,
          },
          {
            Id: "pers0:sx",
            Type: "float",
            Value: 0,
          },
        ],
      },
      (config, value) => {
        setRaw((raw) => [...raw, { length: config.Length, ...value }]);
      }
    );
  }, []);
  const extractXy = (raw, x, y) => [
    [x, y],
    ...raw.map((line) => [line[x], line[y]]),
  ];
  return (
    <div className="App">
      <header className="App-header">
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
      </header>
      <div className={"my-pretty-chart-container"}>
        <Chart
          chartType="ScatterChart"
          data={extractXy(raw, "cons0:x", "pers0:sx")}
          width="100%"
          height="400px"
          legendToggle
        />
      </div>
    </div>
  );
}

export default App;
