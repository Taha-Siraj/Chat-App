import React, { useState } from "react";

const App = () => {
  const [getval1, setVal1] = useState(""); // Empty string initialized
  const [tasks, setTasks] = useState([]); // Renamed `task1` -> `tasks`
  const [checkedTasks, setCheckedTasks] = useState({}); // Track checked items

  const addTask = () => {
    if (getval1.trim()) {
      setTasks((prev) => [...prev, getval1]);
      setVal1("");
    } else {
      alert("Write something in the input box!");
    }
  };

  const handleCheckbox = (index) => {
    setCheckedTasks((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <>
      <h1>Move Tasks</h1>
      <input
        type="text"
        value={getval1}
        onChange={(e) => setVal1(e.target.value)}
        className="border-black"
      />
      <br />
      <br />
      <button onClick={addTask}>Add</button>

      {tasks.map((task, index) => (
        <div key={index}>
          <input
            type="checkbox"
            checked={checkedTasks[index] || false}
            onChange={() => handleCheckbox(index)}
          />
          <span>{task}</span>
        </div>
      ))}
    </>
  );
};

export default App;
