import React, { useState, useEffect } from "react";

import "./App.css";

/**
 *
 *
 * @param {string} input
 * @returns
 */
function process(input) {
  let result = 'SqlQuery.From($@"\n';

  const lines = input.split("\n");
  lines.forEach(line => {
    // remove spaces at beginning
    line = line.replace(/\s*(.*)/, "$1");

    // change known API calls
    line = line.replace(/FromADODeci\((rs\w*)\((.*?)\)\)/i, "$1.GetDeci($2)");

    // remove nonnecessary function
    line = line.replace(/clng\(([^()]*|.*?\(.*?\).*?)\)/gi, "$1");
    line = line.replace(/cdate\(([^()]*|.*?\(.*?\).*?)\)/gi, "$1");
    line = line.replace(/sqltype\(([^()]*|.*?\(.*?\).*?)\)/gi, "{$1}");

    line = line.replace(/&\s*_\s*/gi, "");
    line = line.replace(/\s*&\s*","\s*&/gi, ",");
    line = line.replace(/"\s*&\s*"/gi, "");
    line = line.replace(/}\s*&\s*"/gi, "}");

    line = line.replace(/},"\s*$/gi, "},");

    line = line.trim();

    if (line.startsWith('"') && line.endsWith('"')) {
      line = line.substr(1, line.length - 2);
    }

    result += line + "\n";
  });

  result += '");';
  return result;
}

/**
 *
 *
 * @param {string} input
 * @returns
 */
function process2(input) {
  const lines = input.split("\n").map(line => {
    return line
      .trim()
      .replace(/fromadodeci\s*\((rs\w*)\((.*?)\)\)/gi, "$1.GetDeci($2)")
      .replace(/fromadoint\s*\((rs\w*)\((.*?)\)\)/gi, "$1.GetInt($2)")
      .replace(/clng\(([^()]*|.*?\(.*?\).*?)\)/gi, "$1")
      .replace(/cdate\(([^()]*|.*?\(.*?\).*?)\)/gi, "$1")
      .replace(/sqltype\(([^()]*|.*?\(.*?\).*?)\)/gi, "$1")
      .replace(/&\s*_/gi, ' & "_!_" &');
  });

  let result = lines.join("") + '& ""';

  result = result.replace(/"\s*&\s*"/gi, " ");
  result = result.replace(/"\s*&\s*(.*?)\s*&\s*"/gi, "{$1}");
  result = result.replace(/_!_/gi, "\n");

  return (
    'SqlQuery.From($@"\n' +
    result
      .substr(1, result.length - 2)
      .split("\n")
      .map(line => line.trim())
      .join("\n") +
    '");'
  );
}

function App() {
  const [input, setInput] = useState("");

  useEffect(() => {
    setInput(localStorage.getItem("input") || "");
  }, []);

  const output = process2(input);

  function change(e) {
    setInput(e.target.value);
    localStorage.setItem("input", e.target.value);
  }

  function setExample() {
    setInput(
      '"DELETE FROM RykkerStandard WHERE Opsaetning=" & SQLType(Opsaetning) & " AND RykkerNiveau=" & SQLType(RykkerNiveau)'
    );
  }

  return (
    <div className="App">
      <h1>Convert SQL code from VBScript to C#</h1>
      <span>
        Try inputting{" "}
        <code>
          "DELETE FROM RykkerStandard WHERE Opsaetning=" & SQLType(Opsaetning) &
          " AND RykkerNiveau=" & SQLType(RykkerNiveau)
        </code>{" "}
        or click <button onClick={() => setExample()}>here</button>
      </span>
      <div className="converters">
        <textarea cols="30" rows="10" value={input} onChange={change} />
        <textarea value={output} cols={30} rows={10} />
      </div>
    </div>
  );
}

export default App;
