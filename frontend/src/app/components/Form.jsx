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

// import { useState } from "react";

// const Form = ({ createTodo }) => {
//   const [inputTodo, setInputTodo] = useState({
//     number: "",
//     category: "",
//     content: "",
//     env: "",
//     expected: "",
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setInputTodo({ ...inputTodo, [name]: value });
//   };

//   const addTodo = () => {
//     // 簡易バリデーション（番号か内容があれば追加）
//     if (!inputTodo.number && !inputTodo.content) return;

//     createTodo({ ...inputTodo, id: Math.floor(Math.random() * 1e5) });
//     setInputTodo({
//       number: "",
//       category: "",
//       content: "",
//       env: "",
//       expected: "",
//     });
//   };

//   const tdFormStyle = {
//     padding: "10px",
//     borderTop: "2px solid #333", // リストとの境目
//     borderRight: "1px solid #333", // 縦の実線
//   };

//   return (
//     <tfoot style={{ backgroundColor: "gray" }}>
//       <tr>
//         <td style={{ tdFormStyle }}>
//           <input
//             style={{ width: "95%" }}
//             name="number"
//             value={inputTodo.number}
//             onChange={handleChange}
//           />
//         </td>
//         <td style={{ tdFormStyle }}>
//           <input
//             style={{ width: "95%" }}
//             name="category"
//             value={inputTodo.category}
//             onChange={handleChange}
//           />
//         </td>
//         <td style={{ tdFormStyle }}>
//           <input
//             style={{ width: "95%" }}
//             name="content"
//             value={inputTodo.content}
//             onChange={handleChange}
//           />
//         </td>
//         <td style={{ tdFormStyle }}>
//           <input
//             style={{ width: "95%" }}
//             name="env"
//             value={inputTodo.env}
//             onChange={handleChange}
//           />
//         </td>
//         <td style={{ tdFormStyle }}>
//           <input
//             style={{ width: "95%" }}
//             name="expected"
//             value={inputTodo.expected}
//             onChange={handleChange}
//           />
//         </td>
//         <td style={{ tdFormStyle }}>
//           <button onClick={addTodo} style={{ width: "100%" }}>
//             追加
//           </button>
//         </td>
//       </tr>
//     </tfoot>
//   );
// };

// export default Form;
