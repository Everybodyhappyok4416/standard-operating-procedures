"use client";

import { useState } from "react";
import styles from "./Todo.module.css";

const List = ({ todos, deleteTodo, updateTodo }) => {
  const [editingCell, setEditingCell] = useState({ id: null, key: null });
  // 入力中の文字を一時的に保持するステート
  const [tempValue, setTempValue] = useState("");

  const handleDoubleClick = (todo, key) => {
    setEditingCell({ id: todo.id, key });
    setTempValue(todo[key]); // 編集開始時の値をセット
  };

  const handleBlur = (todo, key) => {
    // 値が変わっていたらバックエンドに送る
    if (todo[key] !== tempValue) {
      updateTodo({ ...todo, [key]: tempValue });
    }
    setEditingCell({ id: null, key: null });
  };

  const renderCell = (todo, key) => {
    const isEditing = editingCell.id === todo.id && editingCell.key === key;

    return (
      <td
        className={styles.td}
        onDoubleClick={() => handleDoubleClick(todo, key)}
      >
        {isEditing ? (
          <input
            autoFocus
            className={styles.input}
            value={tempValue} // 編集中の文字を表示
            onChange={(e) => setTempValue(e.target.value)} // 文字を打つたびにtempValueを更新
            onBlur={() => handleBlur(todo, key)} // 外れたら保存
            onKeyDown={(e) => e.key === "Enter" && e.target.blur()} // Enterで保存
          />
        ) : (
          todo[key]
        )}
      </td>
    );
  };

  return (
    <tbody>
      {todos.map((todo) => (
        <tr key={todo.id}>
          {renderCell(todo, "number")}
          {renderCell(todo, "category")}
          {renderCell(todo, "content")}
          {renderCell(todo, "env")}
          {renderCell(todo, "expected")}
          <td className={styles.td} style={{ textAlign: "center" }}>
            <button onClick={() => deleteTodo(todo.id)}>削除</button>
          </td>
        </tr>
      ))}
    </tbody>
  );
};

export default List;
// ーーーーーーーー
// "use client";

// import { useState } from "react";
// import styles from "./Todo.module.css";

// const List = ({ todos, deleteTodo, updateTodo }) => {
//   const [editingCell, setEditingCell] = useState({ id: null, key: null });

//   const handleDoubleClick = (id, key) => setEditingCell({ id, key });
//   const handleBlur = () => setEditingCell({ id: null, key: null });

//   const renderCell = (todo, key) => {
//     const isEditing = editingCell.id === todo.id && editingCell.key === key;

//     return (
//       <td
//         className={styles.td}
//         onDoubleClick={() => handleDoubleClick(todo.id, key)}
//       >
//         {isEditing ? (
//           <input
//             autoFocus
//             className={styles.input}
//             value={todo[key]}
//             // onChange では「画面（State）の更新」だけやる
//             onChange={(e) => {
//               const newTodo = { ...todo, [key]: e.target.value };
//               setTodos(todos.map((t) => (t.id === todo.id ? newTodo : t))); // 親から渡されたsetTodos等で画面だけ変える
//             }}
//             // フォーカスが外れた（入力完了）時に、初めてバックエンドへ送る
//             onBlur={() => updateTodo(todo)}
//             onKeyDown={(e) => e.key === "Enter" && handleBlur()}
//           />
//         ) : (
//           todo[key]
//         )}
//       </td>
//     );
//   };

//   return (
//     <tbody>
//       {todos.map((todo) => (
//         <tr key={todo.id}>
//           {renderCell(todo, "number")}
//           {renderCell(todo, "category")}
//           {renderCell(todo, "content")}
//           {renderCell(todo, "env")}
//           {renderCell(todo, "expected")}
//           <td className={styles.td} style={{ textAlign: "center" }}>
//             <button onClick={() => deleteTodo(todo.id)}>削除</button>
//           </td>
//         </tr>
//       ))}
//     </tbody>
//   );
// };

// export default List;
//ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
// "use client";
// import { useState } from "react";

// const List = ({ todos, deleteTodo, updateTodo }) => {
//   const tdStyle = {
//     padding: "10px",
//     borderBottom: "1px dotted #ccc",
//     borderRight: "1px solid #333",
//   };

//   // 編集中のセルを特定するためのステート (行IDと列名の組み合わせ)
//   const [editingCell, setEditingCell] = useState({ id: null, key: null });

//   const handleDoubleClick = (id, key) => {
//     setEditingCell({ id, key });
//   };

//   const handleBlur = () => {
//     setEditingCell({ id: null, key: null });
//   };

//   const handleChange = (e, todo, key) => {
//     updateTodo({ ...todo, [key]: e.target.value });
//   };

//   const renderCell = (todo, key) => {
//     const isEditing = editingCell.id === todo.id && editingCell.key === key;

//     return (
//       <td
//         style={tdStyle}
//         onDoubleClick={() => handleDoubleClick(todo.id, key)}
//       >
//         {isEditing ? (
//           <input
//             autoFocus
//             style={{ width: "90%" }}
//             value={todo[key]}
//             onChange={(e) => handleChange(e, todo, key)}
//             onBlur={handleBlur}
//             onKeyDown={(e) => e.key === "Enter" && handleBlur()}
//           />
//         ) : (
//           todo[key]
//         )}
//       </td>
//     );
//   };

//   return (
//     <tbody>
//       {todos.map((todo) => (
//         <tr key={todo.id}>
//           {renderCell(todo, "number")}
//           {renderCell(todo, "category")}
//           {renderCell(todo, "content")}
//           {renderCell(todo, "env")}
//           {renderCell(todo, "expected")}
//           <td style={{ ...tdStyle, textAlign: "center" }}>
//             <button onClick={() => deleteTodo(todo.id)}>削除</button>
//           </td>
//         </tr>
//       ))}
//     </tbody>
//   );
// };

// export default List;
