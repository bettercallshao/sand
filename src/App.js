import "./App.css";
import { useState, useEffect, cloneElement } from "react";
import { Chart } from "react-google-charts";
import sandio from "./sandio";
import "beautiful-react-diagrams/styles.css";
import Diagram, { createSchema, useSchema } from "beautiful-react-diagrams";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { useWhatChanged } from "@simbathesailor/use-what-changed";

const separator = ":";

const boxFromDiagram = (schema, varValue) => {
  const linkMap = schema.links.reduce(
    (dict, l) => ({ ...dict, [l.input]: l.output }),
    {}
  );
  const variable = schema.nodes.reduce(
    (a1, n) => [
      ...a1,
      ...n.outputs.reduce(
        (a2, o) => [
          ...a2,
          { Id: o.id, Type: o.data.type, Value: varValue[o.id] || 0 },
        ],
        []
      ),
      ...n.inputs.reduce((a2, i) => {
        if (!linkMap[i.id]) {
          const id = separator + i.id;
          a2.push({
            Id: id,
            Type: i.data.type,
            Value: varValue[id] || 0,
          });
        }
        return a2;
      }, []),
    ],
    []
  );
  const box = schema.nodes.reduce(
    (arr, n) => [
      ...arr,
      {
        Id: n.id,
        Type: n.data.type,
        Input: n.inputs.map((i) => ({
          Id: i.content,
          Source: linkMap[i.id] || separator + i.id,
        })),
      },
    ],
    []
  );
  return {
    Version: "v1",
    Box: box,
    Variable: variable,
  };
};

const boxType = sandio.builtinBoxType.reduce(
  (res, bt) => ({ ...res, [bt.Id]: bt }),
  {}
);

const DiagramPage = (props) => {
  const { setIo } = props;
  const [localIo, setLocalIo] = useState({});

  const handleRemove = (id) => {
    console.log("78");
    removeNode({ id });
  };

  // the diagram model
  const CustomNode = (props) => {
    const { id, content, inputs, outputs } = props;

    return (
      <div
        className="bi bi-diagram-node bi-diagram-node-default"
        style={{ width: "4rem" }}
      >
        {content}
        <button onClick={() => handleRemove(id)}>x</button>
        <div className="bi-port-wrapper">
          <div className="bi-input-ports">
            {inputs.map((port) =>
              cloneElement(port, {}, <>{port.props.content}</>)
            )}
          </div>
          <div className="bi-output-ports">
            {outputs.map((port) =>
              cloneElement(port, {}, <>{port.props.content}</>)
            )}
          </div>
        </div>
      </div>
    );
  };

  // create diagrams schema
  const [schema, { onChange, removeNode }] = useSchema(
    createSchema({
      nodes: [
        {
          id: "a",
          data: { type: "sin" },
          content: "sin:a",
          coordinates: [166, 60],
          render: CustomNode,
          inputs: [
            {
              id: "a:period",
              content: "period",
              data: { type: "float" },
              alignment: "left",
            },
            {
              id: "a:shift",
              content: "shift",
              data: { type: "float" },
              alignment: "left",
            },
          ],
          outputs: [
            {
              id: "a:x",
              content: "x",
              data: { type: "float" },
              alignment: "right",
            },
          ],
        },
        {
          id: "b",
          data: { type: "integrate" },
          content: "integrate:b",
          coordinates: [469, 44],
          render: CustomNode,
          inputs: [
            {
              id: "b:x",
              content: "x",
              data: { type: "float" },
              alignment: "left",
            },
          ],
          outputs: [
            {
              id: "b:sx",
              content: "sx",
              data: { type: "float" },
              alignment: "right",
            },
          ],
        },
      ],
      links: [{ input: "b:x", output: "a:x" }],
    })
  );
  const options = Object.keys(boxType);
  const [id, setId] = useState("");
  const [type, setType] = useState(options[0]);
  const handleCreate = (event) => {
    console.log("handleCreate");
    const bt = boxType[type];
    onChange({
      nodes: [
        ...schema.nodes,
        {
          id,
          data: { type },
          content: type + separator + id,
          coordinates: [10, 10],
          render: CustomNode,
          inputs: bt.Input.map((i) => ({
            id: id + separator + i.Id,
            content: i.Id,
            data: { type: i.Type },
            alignment: "left",
          })),
          outputs: bt.Output.map((i) => ({
            id: id + separator + i.Id,
            content: i.Id,
            data: { type: i.Type },
            alignment: "right",
          })),
        },
      ],
    });
    event.preventDefault();
  };
  const handleId = (event) => {
    console.log("142");
    setId(event.target.value);
  };
  const handleType = (event) => {
    console.log("146");
    setType(event.target.value);
  };

  const [varValue, setVarValue] = useState({ ":a:period": 1 });
  useWhatChanged(
    [setLocalIo, setIo, schema, varValue],
    "setLocalIo, setIo, schema, varValue"
  );
  useEffect(() => {
    console.log("149");
    setLocalIo(boxFromDiagram(schema, varValue));
  }, [setLocalIo, schema, varValue]);
  useEffect(() => {
    console.log("154");
    setTimeout(() => {
      setIo(localIo);
    }, 1000);
  }, [setIo, localIo]);

  const handleVariable = (event) => {
    console.log("handleVariable");
    setVarValue({
      ...varValue,
      [event.target.name]: parseFloat(event.target.value),
    });
  };

  return (
    <div>
      <form onSubmit={handleCreate}>
        <label>
          Id
          <input type="text" name="id" value={id} onChange={handleId} />
        </label>
        <label>
          Type
          <select value={type} onChange={handleType}>
            {options.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <input type="submit" value="Create" />
      </form>
      <form
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        {(localIo.Variable || []).map((v) => (
          <label key={v.Id}>
            {v.Id}
            <input
              type="number"
              step="0.01"
              name={v.Id}
              value={varValue[v.Id] || 0}
              onChange={handleVariable}
            />
          </label>
        ))}
      </form>
      <div style={{ width: "60rem", height: "30rem" }}>
        <Diagram schema={schema} onChange={onChange} />
      </div>
    </div>
  );
};

const GraphPage = (props) => {
  const { io, setErr } = props;
  const [raw, setRaw] = useState([]);
  const [xAxis, setXAxis] = useState("length");
  const [yAxis, setYAxis] = useState("length");
  const [stepCount, setStepCount] = useState(50);
  const [stepSize, setStepSize] = useState(0.01);
  const extractXy = () => [
    [xAxis, yAxis],
    ...raw.map((line) => [line[xAxis], line[yAxis]]),
  ];
  const getOptions = () => {
    return [{ Id: "length" }, ...(io.Variable || [])].map((v) => (
      <option key={v.Id} value={v.Id}>
        {v.Id}
      </option>
    ));
  };
  useEffect(() => {
    try {
      setRaw([]);
      sandio.run(
        {
          ...io,
          Config: {
            Separator: separator,
            StepCount: stepCount,
            StepSize: stepSize,
          },
        },
        (config, value) => {
          setRaw((raw) => [...raw, { length: config.Length, ...value }]);
        }
      );
      setErr("");
    } catch (sandErr) {
      setErr(sandErr);
    }
  }, [io, setErr, stepCount, stepSize]);
  return (
    <div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <label key="stepCount">
          StepCount
          <input
            type="number"
            step="1"
            value={stepCount}
            onChange={(e) => {
              setStepCount(parseInt(e.target.value));
            }}
          />
        </label>
        <label key="stepSize">
          StepCount
          <input
            type="number"
            step="0.01"
            value={stepSize}
            onChange={(e) => {
              setStepSize(parseFloat(e.target.value));
            }}
          />
        </label>
        <label>
          XAxis
          <select
            value={xAxis}
            onChange={(e) => {
              setXAxis(e.target.value);
            }}
          >
            {getOptions()}
          </select>
        </label>
        <label>
          YAxis
          <select
            value={yAxis}
            onChange={(e) => {
              setYAxis(e.target.value);
            }}
          >
            {getOptions()}
          </select>
        </label>
      </form>
      <div className={"my-pretty-chart-container"}>
        <Chart
          chartType="ScatterChart"
          data={extractXy()}
          width="30rem"
          height="30rem"
          legendToggle
        />
      </div>
    </div>
  );
};

function App() {
  // keep raw data as list of dict
  const [io, setIo] = useState({});
  const [err, setErr] = useState("");
  return (
    <div className="App">
      {err}
      <Tabs forceRenderTabPanel={true}>
        <TabList>
          <Tab>Diagram</Tab>
          <Tab>Graph</Tab>
        </TabList>
        <TabPanel>
          <DiagramPage setIo={setIo} />
        </TabPanel>
        <TabPanel>
          <GraphPage io={io} setErr={setErr} />
        </TabPanel>
      </Tabs>
    </div>
  );
}

export default App;
