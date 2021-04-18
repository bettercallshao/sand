import "./App.css";
import { useState, useEffect, cloneElement } from "react";
import { Chart } from "react-google-charts";
import sandio from "sandio";
import "beautiful-react-diagrams/styles.css";
import Diagram, { createSchema, useSchema } from "beautiful-react-diagrams";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";

function App() {
  const config = {
    StepCount: 2000,
    StepSize: 0.01,
    Separator: ":",
  };

  const boxType = sandio.builtinBoxType.reduce(
    (res, bt) => ({ ...res, [bt.Id]: bt }),
    {}
  );

  const ioFromDiagram = (schema) => {
    const linkMap = schema.links.reduce(
      (dict, l) => ({ ...dict, [l.input]: l.output }),
      {}
    );
    const variable = schema.nodes.reduce(
      (a1, n) => [
        ...a1,
        ...n.outputs.reduce(
          (a2, o) => [...a2, { Id: o.id, Type: o.data.type, value: 0 }],
          []
        ),
        ...n.inputs.reduce((a2, i) => {
          if (!linkMap[i.id]) {
            a2.push({
              Id: config.Separator + i.id,
              Type: i.data.type,
              value: 0,
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
            Source: linkMap[i.id] || i.id,
          })),
        },
      ],
      []
    );
    return {
      Version: "v1",
      Config: config,
      Box: box,
      Variable: variable,
    };
  };

  const UncontrolledDiagram = () => {
    const handleRemove = (id) => {
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
    const [schema, { onChange, removeNode }] = useSchema(createSchema({}));
    const options = Object.keys(boxType);
    const [id, setId] = useState();
    const [type, setType] = useState(options[0]);
    const handleCreate = (event) => {
      const bt = boxType[type];
      onChange({
        nodes: [
          ...schema.nodes,
          {
            id,
            data: { type },
            content: id,
            coordinates: [10, 10],
            render: CustomNode,
            inputs: bt.Input.map((i) => ({
              id: id + config.Separator + i.Id,
              content: i.Id,
              data: { type: i.Type },
              alignment: "left",
            })),
            outputs: bt.Output.map((i) => ({
              id: id + config.Separator + i.Id,
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
      setId(event.target.value);
    };
    const handleType = (event) => {
      setType(event.target.value);
    };

    const [io, setIo] = useState({});
    useEffect(() => {
      setIo(ioFromDiagram(schema));
    }, [schema]);

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
                <option value={value}>{value}</option>
              ))}
            </select>
          </label>
          <input type="submit" value="Create" />
        </form>
        <div style={{ width: "60rem", height: "30rem" }}>
          <Diagram schema={schema} onChange={onChange} />
        </div>
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
      <Tabs>
        <TabList>
          <Tab>Diagram</Tab>
          <Tab>Graph</Tab>
        </TabList>
        <TabPanel>
          <UncontrolledDiagram />
        </TabPanel>
        <TabPanel>
          <div className={"my-pretty-chart-container"}>
            <Chart
              chartType="ScatterChart"
              data={extractXy(raw, "cons0:x", "pers0:sx")}
              width="30rem"
              height="30rem"
              legendToggle
            />
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
}

export default App;
