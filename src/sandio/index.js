import builtinBoxType from "./builtinBoxType.js";

// create map with Id as key
function mapify(arr, fn) {
  return (arr || []).reduce(function (res, item) {
    res[item.Id] = fn ? fn(item) : item;
    return res;
  }, {});
}
// for each value of object
function forEachValue(o, fn) {
  Object.entries(o).forEach(function ([_, v]) {
    fn(v);
  });
}
// apply each value
function applyEachValue(o, fn) {
  const res = {};
  Object.entries(o).forEach(function ([k, v]) {
    res[k] = fn(v);
  });
  return res;
}
// nested loop over inputs of boxes
function forEachBoxInput(box, fn) {
  box.forEach(function (b) {
    b.Input && b.Input.forEach(fn);
  });
}
// do while loop
function doWhile(body, condition) {
  body();
  while (condition()) {
    body();
  }
}
// is variables same type?
function isSameType(a, b) {
  return a.Type === b.Type && a.Size === b.Size;
}

// executes a system object and returns variable states
function run(system, cb) {
  const sys = JSON.parse(JSON.stringify(system));
  const config = { ...sys.Config };
  // put BoxType in a map for lookup with builtin box type
  const boxType = { ...mapify(sys.BoxType), ...mapify(builtinBoxType) };
  // put Variable in a map for lookup
  const variable = mapify(sys.Variable);
  // validate
  if (!sys.Config) {
    throw Error(`Config field is missing.`);
  }
  if (!sys.Box) {
    throw Error(`Box field is missing.`);
  }
  sys.Box.forEach(function (b) {
    if (!t(b)) {
      throw Error(`Type of box ${b.Id} type ${b.Type} is missing.`);
    }
    if (t(b).Input) {
      const input = mapify(b.Input);
      t(b).Input.forEach(function (i) {
        const sid = input[i.Id].Source;
        const s = variable[sid];
        if (!s) {
          throw Error(
            `Source of box ${b.Id} input ${i.Id} variable ${sid} is missing.`
          );
        }
        if (!isSameType(i, s)) {
          throw Error(
            `Type of box ${b.Id} input ${i.Id} mismatches source ${s.Id}.`
          );
        }
      });
    }
    if (!t(b).Output) {
      throw Error(`${b.Type} has no output.`);
    }
    t(b).Output.forEach(function (o) {
      const vid = b.Id + config.Separator + o.Id;
      const v = variable[vid];
      if (!v) {
        throw Error(
          `Source of box ${b.Id} output ${o.Id} variable ${vid} is missing.`
        );
      }
      if (!isSameType(o, v)) {
        throw Error(
          `Type of box ${b.Id} output ${o.Id} mismatches destination ${v.Id}.`
        );
      }
    });
  });
  // treat constant box from persistent box differently
  const isConstBox = (b) => boxType[b.Type].Type === "constant";
  const consBox = sys.Box.filter(isConstBox);
  const persBox = sys.Box.filter((b) => !isConstBox(b));
  // initialize iteration
  forEachValue(variable, function (v) {
    v.Iteration = 0;
  });
  forEachBoxInput(consBox, function (i) {
    i.Iteration = 0;
  });
  // decide whether to run constant box another time
  function needMoreCons() {
    forEachBoxInput(consBox, function (i) {
      if (i.Iteration !== variable[i.Source].Iteration) {
        return true;
      }
    });
    return false;
  }
  // get input map for a box
  function getInput(b) {
    const input = {};
    b.Input &&
      b.Input.forEach(function (i) {
        input[i.Id] = variable[i.Source].Value;
      });
    return input;
  }
  // get box type of box
  function t(b) {
    return boxType[b.Type];
  }
  // get output map for a box
  function getOutput(b) {
    const output = {};
    t(b).Output.forEach(function (o) {
      output[o.Id] = variable[b.Id + config.Separator + o.Id].Value;
    });
    return output;
  }
  // put output map for a box
  function putOutput(b, output) {
    t(b).Output.forEach(function (o) {
      const v = variable[b.Id + config.Separator + o.Id];
      v.Value = output[o.Id];
      v.Iteration += 1;
    });
  }
  // evaluate constant box
  function evalCons() {
    doWhile(function () {
      consBox.forEach(function (b) {
        // eslint-disable-next-line no-unused-vars
        const input = getInput(b);
        // constant box cannot use output / state
        const output = {};
        // eslint-disable-next-line no-eval
        eval(t(b).Function);
        putOutput(b, output);
      });
    }, needMoreCons);
  }
  // evaluate persistent box
  function evalPers() {
    persBox.forEach(function (b) {
      // eslint-disable-next-line no-unused-vars
      const input = getInput(b);
      const output = getOutput(b);
      // eslint-disable-next-line no-eval
      eval(t(b).Function);
      putOutput(b, output);
    });
  }
  // get value from variable
  function getValue() {
    return applyEachValue(variable, (v) => v.Value);
  }
  // set step of config
  function setConfigStep(step) {
    config.Step = step;
    config.Length = step * config.StepSize;
  }

  // evaluate constant once before loop
  setConfigStep(0);
  evalCons();
  cb({ ...config }, getValue(), { ...variable });
  // run experiment loop
  for (let step = 1; step <= config.StepCount; step++) {
    setConfigStep(step);
    evalPers();
    evalCons();
    // callback after constant evaluation and before persistent
    // to provide most sense making representation of the system
    cb({ ...config }, getValue(), { ...variable });
  }
}

const _ = { run, builtinBoxType };
export default _;
