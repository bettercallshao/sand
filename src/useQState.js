import { useState, useCallback } from "react";
import qs from "query-string";
import Msgpack from "msgpack-lite";
const Base65536 = require("base65536");

function uniencode(obj) {
  return Base65536.encode(Msgpack.encode(obj));
}

function unidecode(str) {
  return Msgpack.decode(Base65536.decode(str));
}

const setQueryStringWithoutPageReload = (qsValue) => {
  const newurl =
    window.location.protocol +
    "//" +
    window.location.host +
    window.location.pathname +
    qsValue;

  window.history.pushState({ path: newurl }, "", newurl);
};

const setQueryStringValue = (
  key,
  value,
  queryString = window.location.search
) => {
  const values = qs.parse(queryString);
  const newQsValue = qs.stringify({ ...values, [key]: uniencode(value) });
  setQueryStringWithoutPageReload(`?${newQsValue}`);
};

const getQueryStringValue = (key, queryString = window.location.search) => {
  const values = qs.parse(queryString);
  return values[key] ? unidecode(values[key]) : values[key];
};

function useQState(key, initialValue) {
  const [value, setValue] = useState(getQueryStringValue(key) || initialValue);
  const onSetValue = useCallback(
    (newValue) => {
      setValue(newValue);
      setQueryStringValue(key, newValue);
    },
    [key]
  );

  return [value, onSetValue];
}

export default useQState;
