import { useState } from "react";
import styles from "./Todo.module.css";

// 孫コンポーネント：入力セルの共通化
const FormCell = ({ children }) => (
  <td className={styles.tdForm}>{children}</td>
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
    createTodo({ ...inputTodo, id: Math.floor(Math.random() * 1e5) }); //{}の内容がnewTodoとして渡る
    setInputTodo({
      number: "",
      category: "",
      content: "",
      env: "",
      expected: "",
    });
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
          <button onClick={addTodo} className={styles.buttonAdd}>
            追加
          </button>
        </FormCell>
      </tr>
    </tfoot>
  );
};

export default Form;