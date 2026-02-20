import { useState } from "react";
import styles from "./Todo.module.css";

// 孫コンポーネント：入力セルの共通化
const FormCell = ({ children }) => (
  <td className={styles.tdForm}>{children}</td>
);

const Form = ({ createTodo }) => {
  const [inputTodo, setInputTodo] = useState({
    number: "", category: "", content: "", env: "", expected: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputTodo({ ...inputTodo, [name]: value });
  };

  const addTodo = () => {
    if (!inputTodo.number && !inputTodo.content) return;
    createTodo({ ...inputTodo, id: Math.floor(Math.random() * 1e5) });
    setInputTodo({ number: "", category: "", content: "", env: "", expected: "" });
  };

  const fields = ["number", "category", "content", "env", "expected"];

  return (
    <tfoot className={styles.tfoot}>
      <tr>
        {fields.map((field) => (
          <FormCell key={field}>
            <input
              className={styles.input}
              name={field}
              value={inputTodo[field]}
              onChange={handleChange}
              placeholder={field}
            />
          </FormCell>
        ))}
        <FormCell>
          <button onClick={addTodo} className={styles.buttonAdd}>追加</button>
        </FormCell>
      </tr>
    </tfoot>
  );
};

export default Form;
