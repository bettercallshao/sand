import "./App.css";
import { useState, useEffect, cloneElement } from "react";
import { Chart } from "react-google-charts";
import sandio from "sandio";
import "beautiful-react-diagrams/styles.css";
import Diagram, { createSchema, useSchema } from "beautiful-react-diagrams";

function App() {
  // the diagram model
  const CustomNode = (props) => {
    const { content, inputs, outputs, type } = props;

    return (
      <div
        className="bi bi-diagram-node bi-diagram-node-default"
        style={{ width: "4rem" }}
      >
        {content}
        <div className="bi-port-wrapper">
          <div className="bi-input-ports">
            {inputs.map((port) => cloneElement(port, {}, <>{port.key}</>))}
          </div>
          <div className="bi-output-ports">
            {outputs.map((port) => cloneElement(port, {}, <>{port.key}</>))}
          </div>
        </div>
      </div>
    );
  };

  const initialSchema = createSchema({
    nodes: [
      {
        id: "node-1",
        content: "Node 1",
        coordinates: [150, 60],
        render: CustomNode,
        outputs: [{ id: "x", alignment: "right" }],
      },
      {
        id: "node-custom",
        content: "asdf",
        coordinates: [250, 60],
        render: CustomNode,
        inputs: [
          { id: "a", alignment: "left" },
          { id: "b", alignment: "left" },
        ],
      },
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
