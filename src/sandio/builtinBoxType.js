// built-in box types
const builtinBoxType = [
  {
    Id: "multiply",
    Type: "constant",
    Input: [
      {
        Id: "a",
        Type: "float",
      },
      {
        Id: "b",
        Type: "float",
      },
    ],
    Output: [
      {
        Id: "x",
        Type: "float",
      },
    ],
    Function: "output.x = input.a * input.b",
  },
  {
    Id: "add",
    Type: "constant",
    Input: [
      {
        Id: "a",
        Type: "float",
      },
      {
        Id: "b",
        Type: "float",
      },
    ],
    Output: [
      {
        Id: "x",
        Type: "float",
      },
    ],
    Function: "output.x = input.a + input.b",
  },
  {
    Id: "subtract",
    Type: "constant",
    Input: [
      {
        Id: "a",
        Type: "float",
      },
      {
        Id: "b",
        Type: "float",
      },
    ],
    Output: [
      {
        Id: "x",
        Type: "float",
      },
    ],
    Function: "output.x = input.a - input.b",
  },
  {
    Id: "sin",
    Type: "constant",
    Input: [
      {
        Id: "period",
        Type: "float",
      },
      {
        Id: "shift",
        Type: "float",
      },
    ],
    Output: [
      {
        Id: "x",
        Type: "float",
      },
    ],
    Function:
      "output.x = Math.sin((config.Length - input.shift) / input.period * 2 * Math.PI)",
  },
  {
    Id: "step",
    Type: "constant",
    Input: [
      {
        Id: "length",
        Type: "float",
      },
    ],
    Output: [
      {
        Id: "x",
        Type: "float",
      },
    ],
    Function: "output.x = config.Length > input.length ? 1 : 0",
  },
  {
    Id: "integrate",
    Type: "persistent",
    Input: [
      {
        Id: "x",
        Type: "float",
      },
    ],
    Output: [
      {
        Id: "sx",
        Type: "float",
      },
    ],
    Function: "output.sx += input.x * config.StepSize",
  },
];

export default builtinBoxType;
