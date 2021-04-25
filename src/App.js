import "./App.css";
import { useState, useEffect, cloneElement } from "react";
import { Chart } from "react-google-charts";
import sandio from "./sandio";
import "beautiful-react-diagrams/styles.css";
import Diagram, { createSchema, useSchema } from "beautiful-react-diagrams";
import "react-tabs/style/react-tabs.css";
import SplitterLayout from "react-splitter-layout";
import "react-splitter-layout/lib/index.css";
import useQState from "./useQState";

const boxFromDiagram = (schema, varValue, config) => {
  const linkMap = (schema.links || []).reduce(
    (dict, l) => ({ ...dict, [l.input]: l.output }),
    {}
  );
  const variable = (schema.nodes || []).reduce(
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
          const id = config.Separator + i.id;
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
  const box = (schema.nodes || []).reduce(
    (arr, n) => [
      ...arr,
      {
        Id: n.id,
        Type: n.data.type,
        Input: n.inputs.map((i) => ({
          Id: i.content,
          Source: linkMap[i.id] || config.Separator + i.id,
        })),
      },
    ],
    []
  );
  return {
    Box: box,
    Variable: variable,
    Config: { ...config },
  };
};

const DiagramPage = (props) => {
  const { initialSchema, setSchema, separator } = props;

  const boxType = sandio.builtinBoxType.reduce(
    (res, bt) => ({ ...res, [bt.Id]: bt }),
    {}
  );

  const handleRemove = (id) => {
    removeNode({ id });
  };

  const CustomNode = (props) => {
    const { id, content, inputs, outputs } = props;

    return (
      <div
        className="bi bi-diagram-node bi-diagram-node-default"
        style={{ width: "4rem", opacity: 0.6 }}
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

  let validInitialSchema;
  if (initialSchema.nodes && initialSchema.nodes.length) {
    initialSchema.nodes.forEach((n) => {
      n["render"] = CustomNode;
    });
    validInitialSchema = initialSchema;
  }

  // create diagrams schema
  const [schema, { onChange, removeNode }] = useSchema(
    createSchema(
      validInitialSchema || {
        nodes: [
          {
            id: "step",
            data: { type: "step" },
            content: "step:step",
            coordinates: [66, 60],
            render: CustomNode,
            inputs: [
              {
                id: "step:length",
                content: "length",
                data: { type: "float" },
                alignment: "left",
              },
            ],
            outputs: [
              {
                id: "step:x",
                content: "x",
                data: { type: "float" },
                alignment: "right",
              },
            ],
          },
          {
            id: "inte",
            data: { type: "integrate" },
            content: "integrate:inte",
            coordinates: [540, 7],
            render: CustomNode,
            inputs: [
              {
                id: "inte:x",
                content: "x",
                data: { type: "float" },
                alignment: "left",
              },
            ],
            outputs: [
              {
                id: "inte:sx",
                content: "sx",
                data: { type: "float" },
                alignment: "right",
              },
            ],
          },
          {
            id: "subt",
            data: { type: "subtract" },
            content: "subtract:subt",
            coordinates: [235, 27],
            render: CustomNode,
            inputs: [
              {
                id: "subt:a",
                content: "a",
                data: { type: "float" },
                alignment: "left",
              },
              {
                id: "subt:b",
                content: "b",
                data: { type: "float" },
                alignment: "left",
              },
            ],
            outputs: [
              {
                id: "subt:x",
                content: "x",
                data: { type: "float" },
                alignment: "right",
              },
            ],
          },
          {
            id: "subt2",
            data: { type: "subtract" },
            content: "subtract:subt2",
            coordinates: [381, 16],
            render: CustomNode,
            inputs: [
              {
                id: "subt2:a",
                content: "a",
                data: { type: "float" },
                alignment: "left",
              },
              {
                id: "subt2:b",
                content: "b",
                data: { type: "float" },
                alignment: "left",
              },
            ],
            outputs: [
              {
                id: "subt2:x",
                content: "x",
                data: { type: "float" },
                alignment: "right",
              },
            ],
          },
          {
            id: "mult",
            data: { type: "multiply" },
            content: "multiply:mult",
            coordinates: [224, 164],
            render: CustomNode,
            inputs: [
              {
                id: "mult:a",
                content: "a",
                data: { type: "float" },
                alignment: "left",
              },
              {
                id: "mult:b",
                content: "b",
                data: { type: "float" },
                alignment: "left",
              },
            ],
            outputs: [
              {
                id: "mult:x",
                content: "x",
                data: { type: "float" },
                alignment: "right",
              },
            ],
          },
          {
            id: "inte2",
            data: { type: "integrate" },
            content: "integrate:inte2",
            coordinates: [600, 126],
            render: CustomNode,
            inputs: [
              {
                id: "inte2:x",
                content: "x",
                data: { type: "float" },
                alignment: "left",
              },
            ],
            outputs: [
              {
                id: "inte2:sx",
                content: "sx",
                data: { type: "float" },
                alignment: "right",
              },
            ],
          },
        ],
        links: [
          { input: "subt:a", output: "step:x" },
          { input: "subt2:a", output: "subt:x" },
          { input: "inte:x", output: "subt2:x" },
          { input: "subt2:b", output: "mult:x" },
          { input: "subt:b", output: "inte:sx" },
          { input: "inte2:x", output: "inte:sx" },
          { input: "mult:a", output: "inte2:sx" },
        ],
      }
    )
  );
  const options = Object.keys(boxType);
  const [id, setId] = useState("");
  const [type, setType] = useState(options[0]);
  const handleCreate = (event) => {
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
    setId(event.target.value);
  };
  const handleType = (event) => {
    setType(event.target.value);
  };

  useEffect(() => {
    setSchema(schema);
  }, [setSchema, schema]);

  return (
    <div>
      <form onSubmit={handleCreate}>
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
        <label>
          Id
          <input type="text" name="id" value={id} onChange={handleId} />
        </label>
        <input type="submit" value="Create" />
      </form>
      <div style={{ width: "100rem", height: "100rem" }}>
        <Diagram schema={schema} onChange={onChange} />
      </div>
    </div>
  );
};

const IoPage = (props) => {
  const { schema, separator, setRaw } = props;
  const [err, setErr] = useState("");
  const [io, setIo] = useState({});
  const [varValue, setVarValue] = useQState("varValue", {
    ":step:length": 1,
    ":mult:b": 2.3,
  });
  const [stepCount, setStepCount] = useQState("stepCount", 100);
  const [stepSize, setStepSize] = useQState("stepSize", 0.1);
  const handleVariable = (event) => {
    setVarValue({
      ...varValue,
      [event.target.name]: parseFloat(event.target.value),
    });
  };
  useEffect(() => {
    setIo(
      boxFromDiagram(schema, varValue, {
        Separator: separator,
        StepCount: stepCount,
        StepSize: stepSize,
      })
    );
  }, [setIo, schema, varValue, stepCount, stepSize, separator]);
  useEffect(() => {
    try {
      setRaw([]);
      sandio.run(io, (config, value) => {
        setRaw((raw) => [...raw, { length: config.Length, ...value }]);
      });
      setErr("");
    } catch (sandErr) {
      setErr(sandErr.message);
    }
  }, [io, setErr, setRaw]);
  return (
    <div style={{ textAlign: "right" }}>
      <a href="https://github.com/bettercallshao/sand">
        {process.env.REACT_APP_VERSION}
      </a>
      {err}
      <form
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <label key="stepCount">
          stepCount
          <input
            type="number"
            step="1"
            value={stepCount}
            onChange={(e) => {
              setStepCount(parseInt(e.target.value));
            }}
          />
          <br />
        </label>
        <label key="stepSize">
          stepSize
          <input
            type="number"
            step="0.01"
            value={stepSize}
            onChange={(e) => {
              setStepSize(parseFloat(e.target.value));
            }}
          />
          <br />
        </label>
        {(io.Variable || [])
          .sort((a, b) => (a.Id > b.Id ? 1 : -1))
          .map((v) => (
            <label key={v.Id}>
              {v.Id}
              <input
                type="number"
                step="0.1"
                name={v.Id}
                value={varValue[v.Id] || 0}
                onChange={handleVariable}
              />
              <br />
            </label>
          ))}
      </form>
    </div>
  );
};

const GraphPage = (props) => {
  const { iden, raw, separator } = props;
  const [xAxis, setXAxis] = useQState(iden + ".xAxis", "length");
  const [yAxis, setYAxis] = useQState(iden + ".yAxis", "length");
  const extractXy = () => [
    [xAxis, yAxis],
    ...raw.map((line) => [line[xAxis], line[yAxis]]),
  ];
  const getOptions = () => {
    return (raw.length
      ? Object.keys(raw[0])
          .filter((k) => !k.startsWith(separator))
          .sort()
      : []
    ).map((k) => (
      <option key={k} value={k}>
        {k}
      </option>
    ));
  };
  return (
    <div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
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
      <div
        className={"my-pretty-chart-container"}
        style={{ display: "flex", justifyContent: "center" }}
      >
        <Chart
          chartType="ScatterChart"
          data={extractXy()}
          width="30rem"
          height="30rem"
          options={{
            chartArea: { width: "90%", height: "90%" },
            legend: "none",
          }}
        />
      </div>
    </div>
  );
};

function App() {
  // keep raw data as list of dict
  const separator = ":";
  const [schema, setSchema] = useQState("schema", {});
  const [raw, setRaw] = useState([]);
  return (
    <div className="App">
      <SplitterLayout vertical>
        <SplitterLayout secondaryInitialSize={300}>
          <DiagramPage
            initialSchema={schema}
            setSchema={setSchema}
            separator={separator}
          />
          <IoPage schema={schema} separator={separator} setRaw={setRaw} />
        </SplitterLayout>
        <SplitterLayout>
          <GraphPage iden="l" raw={raw} separator={separator} />
          <GraphPage iden="r" raw={raw} separator={separator} />
        </SplitterLayout>
      </SplitterLayout>
    </div>
  );
}

export default App;
