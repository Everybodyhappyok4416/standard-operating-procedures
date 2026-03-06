import { useState } from "react";
import styles from "./Todo.module.css";

// 孫コンポーネント：入力セルの共通化
const FormCell = ({ children, className }) => (
<td className={`${styles.tdForm} ${className || ""}`}>{children}</td>
);

//入力中の追加前の値を随時保存
const Form = ({ createTodo }) => {
  const [inputTodo, setInputTodo] = useState({
    number: "",
    category: "",
    content: "",
    env: "",
    expected: "",
  });

  //name(属性)と入力中の値を対応させて, inputTodoを随時置き換え
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputTodo({ ...inputTodo, [name]: value });
  };

  const addTodo = () => {
    // 全ての項目が埋まっているかチェック
    const isAllFilled = Object.values(inputTodo).every(
      (value) => value.trim() !== "",
    );
    if (!isAllFilled) {
      alert("すべての項目を入力してください。");
      return; // 1つでも空があればここで終了
    }
createTodo(inputTodo); 
    setInputTodo({
      number: "",
      category: "",
      content: "",
      env: "",
      expected: "",
    });
  };

const inputFields = [
    { name: "number",   class: styles.colNumber },
    { name: "category", class: styles.colCategory },
    { name: "content",  class: styles.colContent },
    { name: "env",      class: styles.colEnv },
    { name: "expected", class: styles.colExpected },
  ];

  return (
    <tfoot className={styles.tfoot}>
      <tr>
        {inputFields.map((f) => (
          <FormCell key={f.name} className={f.class}>
            <input
              className={styles.input}
              name={f.name}
              value={inputTodo[f.name]}
              onChange={handleChange}
              placeholder={f.name}
            />
          </FormCell>
        ))}
        <FormCell className={styles.colCheck}></FormCell>
        <FormCell className={styles.colTime}></FormCell>
        <FormCell>
          <button onClick={addTodo} className={styles.buttonAdd}>
            追加
          </button>
        </FormCell>
      </tr>
    </tfoot>
  );
};

export default Form;