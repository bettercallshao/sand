import "./App.css";
import { useState, useEffect } from "react";
import { Chart } from "react-google-charts";
import sandio from "sandio";
import "beautiful-react-diagrams/styles.css";
import Diagram, { createSchema, useSchema } from "beautiful-react-diagrams";

function App() {
  // the diagram model
  const initialSchema = createSchema({
    nodes: [
      { id: "node-1", content: "Node 1", coordinates: [250, 60] },
      { id: "node-2", content: "Node 2", coordinates: [100, 200] },
      { id: "node-3", content: "Node 3", coordinates: [250, 220] },
      { id: "node-4", content: "Node 4", coordinates: [400, 200] },
    ],
    links: [
      { input: "node-1", output: "node-2" },
      { input: "node-1", output: "node-3" },
      { input: "node-1", output: "node-4" },
    ],
  });

  const UncontrolledDiagram = () => {
    // create diagrams schema
    const [schema, { onChange }] = useSchema(initialSchema);

    return (
      <div style={{ height: "22.5rem" }}>
        <Diagram schema={schema} onChange={onChange} />
      </div>
    );
  };

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
      <UncontrolledDiagram />
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
